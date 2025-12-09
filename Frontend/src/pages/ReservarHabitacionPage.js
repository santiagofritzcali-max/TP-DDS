// src/pages/ReservarHabitacionPage.js
import React, { useState, useMemo } from "react";
import "../styles/reservarHabitacionStyle.css";
import { buscarDisponibilidad } from "../services/reservaService";
import { validarRangoFechas } from "../validators/validarReservaHabitacion";
import { useNavigate } from "react-router-dom";
import PopupHabitacionNoDisponible from "../components/PopupHabitacionNoDisponible"; // 👈 NUEVO

// Mapeo nro habitación (para mostrar tipo en el panel derecho)
const ROOM_TYPES_BY_NUMBER = {
  "101": "Individual Estándar",
  "102": "Individual Estándar",
  "201": "Doble Estándar",
  "203": "Doble Estándar",
  "301": "Doble Superior",
  "302": "Doble Superior",
  "404": "Superior Family",
  "500": "Suite",
};

// Igual que en CU05: pasa del enum del back a texto legible
const prettyTipoHabitacion = (raw) => {
  const t = String(raw || "").toUpperCase();
  const map = {
    INDIVIDUAL_ESTANDAR: "Individual Estándar",
    DOBLE_ESTANDAR: "Doble Estándar",
    DOBLE_SUPERIOR: "Doble Superior",
    SUPERIOR_FAMILY: "Superior Family",
    SUITE: "Suite",
  };
  return map[t] || raw;
};

// parsear "dd/MM/yyyy" a Date
const parseDdMmYyyy = (s) => {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("/");
  return new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    0,
    0,
    0,
    0
  );
};

// formatear Date otra vez a "dd/MM/yyyy"
const formatDateFromObj = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

const ReservarHabitacionPage = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [grid, setGrid] = useState([]); // [{fecha, habitaciones:[{nro, estado}]}]
  const [columnas, setColumnas] = useState([]); // [{nro:"1-101", tipo:"INDIVIDUAL_ESTANDAR"}, ...]
  const [selectedCells, setSelectedCells] = useState([]); // {fecha, nro}
  const [mensajeSinHabitaciones, setMensajeSinHabitaciones] = useState("");
  const [errorFechas, setErrorFechas] = useState("");

  // 👇 NUEVO: estado para popup
  const [showNoDispPopup, setShowNoDispPopup] = useState(false);
  const [rangoNoDisp, setRangoNoDisp] = useState(null);

  const navigate = useNavigate();

  // Agrupamos columnas por tipo de habitación (para header doble como CU05)
  const gruposColumnas = useMemo(() => {
    if (!Array.isArray(columnas) || columnas.length === 0) return [];

    const map = new Map(); // tipo -> [cols]

    columnas.forEach((col) => {
      const tipo = col.tipo || "Tipo";
      if (!map.has(tipo)) {
        map.set(tipo, []);
      }
      map.get(tipo).push(col);
    });

    return Array.from(map.entries()).map(([tipo, cols]) => ({
      tipo,
      cols,
    }));
  }, [columnas]);

  // -------------------------------------------------------------------
  // BUSCAR DISPONIBILIDAD
  // -------------------------------------------------------------------
  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorFechas("");
    setMensajeSinHabitaciones("");

    const error = validarRangoFechas(fechaDesde, fechaHasta);
    if (error) {
      setErrorFechas(error);
      return;
    }

    try {
      const { grid: nuevaGrid, columnas: nuevasCols } =
        await buscarDisponibilidad(fechaDesde, fechaHasta);

      setGrid(nuevaGrid);
      setColumnas(nuevasCols);
      setSelectedCells([]);

      setMensajeSinHabitaciones(
        nuevaGrid.length === 0
          ? "No hay habitaciones disponibles para el rango seleccionado."
          : ""
      );
    } catch (err) {
      console.error(err);
      setMensajeSinHabitaciones(
        "Ocurrió un error al buscar la disponibilidad."
      );
    }
  };

  // -------------------------------------------------------------------
  // Helpers de selección / estado
  // -------------------------------------------------------------------

  // 👉 NUEVO: ahora permitimos seleccionar cualquier estado
  const toggleCell = (fecha, nro /*, estado */) => {
    const key = `${fecha}-${nro}`;
    const yaSeleccionada = selectedCells.some(
      (c) => `${c.fecha}-${c.nro}` === key
    );

    if (yaSeleccionada) {
      setSelectedCells(
        selectedCells.filter((c) => `${c.fecha}-${c.nro}` !== key)
      );
    } else {
      setSelectedCells([...selectedCells, { fecha, nro }]);
    }
  };

  const handleCancelar = () => {
    // 7.A.2 El CU termina 
    navigate(-1);
  };


  const estaSeleccionada = (fecha, nro) =>
    selectedCells.some((c) => c.fecha === fecha && c.nro === nro);


  const getEstadoCelda = (fecha, nro) => {
    const fila = grid.find((f) => f.fecha === fecha);
    if (!fila) return null;
    const celda = (fila.habitaciones || []).find((h) => h.nro === nro);
    return celda?.estado ?? null; // "disponible", "reservada", "ocupada", "fuera-servicio", etc.
  };

  // -------------------------------------------------------------------
  // ORDENAMIENTO BÁSICO POR FECHA Y HABITACIÓN (celdas individuales)
  // -------------------------------------------------------------------
  const habitacionesOrdenadas = useMemo(() => {
    return [...selectedCells].sort((a, b) => {
      const ka = `${a.fecha}-${a.nro}`;
      const kb = `${b.fecha}-${b.nro}`;
      return ka.localeCompare(kb);
    });
  }, [selectedCells]);

  // -------------------------------------------------------------------
  // AGRUPAR POR HABITACIÓN + RANGOS CONSECUTIVOS DE FECHAS
  // Resultado: [{ nro, fechaIngreso, fechaEgreso }]
  // -------------------------------------------------------------------
  const reservasAgrupadas = useMemo(() => {
    if (habitacionesOrdenadas.length === 0) return [];

    const porHabitacion = new Map(); // nro -> [fechas]
    habitacionesOrdenadas.forEach((c) => {
      const nro = String(c.nro);
      const fecha = c.fecha;
      if (!porHabitacion.has(nro)) porHabitacion.set(nro, []);
      porHabitacion.get(nro).push(fecha);
    });

    const resultado = [];

    porHabitacion.forEach((fechas, nro) => {
      const ordenadas = [...new Set(fechas)].sort((f1, f2) => {
        const d1 = parseDdMmYyyy(f1);
        const d2 = parseDdMmYyyy(f2);
        return d1 - d2;
      });

      if (ordenadas.length === 0) return;

      let inicio = ordenadas[0];
      let prevDate = parseDdMmYyyy(ordenadas[0]);

      for (let i = 1; i < ordenadas.length; i++) {
        const actual = ordenadas[i];
        const dActual = parseDdMmYyyy(actual);
        const diffDias = (dActual - prevDate) / (1000 * 60 * 60 * 24);

        if (diffDias === 1) {
          prevDate = dActual;
        } else {
          resultado.push({
            nro,
            fechaIngreso: inicio,
            fechaEgreso: formatDateFromObj(prevDate),
          });
          inicio = actual;
          prevDate = dActual;
        }
      }

      resultado.push({
        nro,
        fechaIngreso: inicio,
        fechaEgreso: formatDateFromObj(prevDate),
      });
    });

    return resultado.sort((a, b) => {
      if (a.nro === b.nro) {
        const da = parseDdMmYyyy(a.fechaIngreso);
        const db = parseDdMmYyyy(b.fechaIngreso);
        return da - db;
      }
      return a.nro.localeCompare(b.nro);
    });
  }, [habitacionesOrdenadas]);

  // -------------------------------------------------------------------
  // Construir rango no disponible (para el popup)
  // -------------------------------------------------------------------
  const calcularRangoNoDisponible = () => {
    const fechasNoDisp = [];

    selectedCells.forEach(({ fecha, nro }) => {
      const estado = getEstadoCelda(fecha, nro);
      if (estado && estado !== "disponible") {
        fechasNoDisp.push(fecha);
      }
    });

    if (fechasNoDisp.length === 0) return null;

    // Fechas únicas ordenadas
    const ordenadas = [...new Set(fechasNoDisp)].sort((f1, f2) => {
      const d1 = parseDdMmYyyy(f1);
      const d2 = parseDdMmYyyy(f2);
      return d1 - d2;
    });

    return {
      desde: ordenadas[0],
      hasta: ordenadas[ordenadas.length - 1],
      cantidad: ordenadas.length, // 👈 cantidad de fechas no disponibles
    };
  };

  // -------------------------------------------------------------------
  // SIGUIENTE -> segunda pantalla CU04
  // -------------------------------------------------------------------
  const handleSiguiente = () => {
    if (reservasAgrupadas.length === 0) return;

    // 1) verificar si hay alguna celda no disponible
    const hayNoDisponible = selectedCells.some(({ fecha, nro }) => {
      const estado = getEstadoCelda(fecha, nro);
      return estado && estado !== "disponible";
    });

    if (hayNoDisponible) {
      const rango = calcularRangoNoDisponible();
      setRangoNoDisp(rango);
      setShowNoDispPopup(true);
      return; // NO navega a la siguiente pantalla
    }

    // 2) si todo es disponible, seguimos normal
    navigate("/datos-reserva", {
      state: {
        fechaDesde,
        fechaHasta,
        habitaciones: reservasAgrupadas.map((r) => ({
          nro: String(r.nro),
          fechaIngreso: r.fechaIngreso,
          fechaEgreso: r.fechaEgreso,
        })),
      },
    });
  };

  // 👈 NUEVO: cerrar popup -> limpiar selección
  const handleCloseNoDispPopup = () => {
    setShowNoDispPopup(false);
    setSelectedCells([]); // limpia grilla y panel derecho
  };

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  return (
    <div className="reserva-page">
      <main className="main-layout">
        {/* IZQUIERDA */}
        <section className="left-panel">
          <section className="reservation-search">
            <h1 className="section-title">Reserva de Habitación</h1>

            <form className="date-form" onSubmit={handleBuscar}>
              <div className="date-field">
                <label htmlFor="desde">
                  Desde <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="desde"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  required
                />
              </div>

              <div className="date-field">
                <label htmlFor="hasta">
                  Hasta <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="hasta"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-button">
                Buscar habitaciones
              </button>
            </form>

            {errorFechas && <p className="error-text">{errorFechas}</p>}
          </section>

          <section className="rooms-grid-section">
            <h1 className="section-title">Habitaciones</h1>

            <div className="legend">
              <div className="legend-item">
                <span className="legend-color estado-disponible" />
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <span className="legend-color estado-reservada" />
                <span>Reservada</span>
              </div>
              <div className="legend-item">
                <span className="legend-color estado-ocupada" />
                <span>Ocupada</span>
              </div>
              <div className="legend-item">
                <span className="legend-color estado-fuera-servicio" />
                <span>Fuera de servicio</span>
              </div>
            </div>

            <div className="grid-rounded-wrapper">
              <table className="rooms-table">
                <thead>
                  {/* Encabezado igual a CU05 */}
                  <tr>
                    <th className="col-dia" rowSpan={2}>
                      Días de
                    </th>

                    {gruposColumnas.length > 0 ? (
                      gruposColumnas.map((g) => (
                        <th key={g.tipo} colSpan={g.cols.length}>
                          {prettyTipoHabitacion(g.tipo)}
                        </th>
                      ))
                    ) : (
                      <th colSpan={5}></th>
                    )}
                  </tr>

                  <tr>
                    {gruposColumnas.length > 0 &&
                      gruposColumnas.flatMap((g) =>
                        g.cols.map((col) => (
                          <th key={col.nro}>{col.nro}</th>
                        ))
                      )}
                  </tr>
                </thead>

                <tbody>
                  {grid.map((fila, rowIndex) => (
                    <tr key={fila.fecha}>
                      <td className="dia-label">{fila.fecha}</td>

                      {fila.habitaciones.map((hab, index) => {
                        const seleccion = estaSeleccionada(
                          fila.fecha,
                          hab.nro
                        );

                        const seleccionArriba =
                          rowIndex > 0 &&
                          estaSeleccionada(
                            grid[rowIndex - 1].fecha,
                            grid[rowIndex - 1].habitaciones[index].nro
                          );

                        const seleccionAbajo =
                          rowIndex < grid.length - 1 &&
                          estaSeleccionada(
                            grid[rowIndex + 1].fecha,
                            grid[rowIndex + 1].habitaciones[index].nro
                          );

                        const extraClasses = [];
                        if (seleccion && (seleccionArriba || seleccionAbajo)) {
                          extraClasses.push("range-block");
                        }
                        if (seleccion && !seleccionArriba && seleccionAbajo) {
                          extraClasses.push("range-start");
                        }
                        if (seleccion && seleccionArriba && !seleccionAbajo) {
                          extraClasses.push("range-end");
                        }

                        const clases = [
                          "cell",
                          `estado-${hab.estado}`,
                          seleccion ? "cell-seleccionada" : "",
                          ...extraClasses,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <td
                            key={`${fila.fecha}-${index}`}
                            className={clases}
                            onClick={() =>
                              toggleCell(fila.fecha, hab.nro, hab.estado)
                            }
                            data-room={hab.nro}
                          ></td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mensajeSinHabitaciones && (
              <p className="no-rooms-message">{mensajeSinHabitaciones}</p>
            )}
          </section>
        </section>

        {/* DERECHA */}
        <aside className="right-panel">
          <div className="right-panel-content">
            <h2 className="section-subtitle">Habitaciones a Reservar</h2>

            <div className="selected-rooms-list">
              {reservasAgrupadas.length === 0 ? (
                <p className="text-empty-right">
                  No hay habitaciones seleccionadas.
                </p>
              ) : (
                reservasAgrupadas.map((item, idx) => {
                  const nroCompleto = String(item.nro); // "1-201"
                  const nroSimple = nroCompleto.includes("-")
                    ? nroCompleto.split("-")[1]
                    : nroCompleto;

                  const tipo =
                    ROOM_TYPES_BY_NUMBER[nroSimple] ||
                    `Habitación ${nroCompleto}`;

                  return (
                    <div className="selected-room-item" key={idx}>
                      <div className="selected-room-type">
                        Habitación: {nroCompleto}
                      </div>
                      <div className="selected-room-line">Tipo: {tipo}</div>
                      <div className="selected-room-line">
                        Ingreso: {item.fechaIngreso}, 12:00 hs
                      </div>
                      <div className="selected-room-line">
                        Egreso: {item.fechaEgreso}, 10:00 hs
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="actions-row">
            <button className="secondary-button" onClick={handleCancelar}>
              Cancelar
            </button>

            <button
              className="primary-button primary-button-strong"
              onClick={handleSiguiente}
              disabled={reservasAgrupadas.length === 0}
            >
              Siguiente
            </button>
          </div>
        </aside>
      </main>

      {/* POPUP DE HABITACIÓN NO DISPONIBLE */}
      {showNoDispPopup && (
        <PopupHabitacionNoDisponible
          rango={rangoNoDisp}   // 👈 le pasamos {desde, hasta, cantidad}
          onClose={handleCloseNoDispPopup}
        />
      )}
    </div>
  );
};

export default ReservarHabitacionPage;
