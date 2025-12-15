// src/pages/ReservarHabitacionPage.js
import React, { useState, useMemo } from "react";
import "../styles/reservarHabitacionStyle.css";
import "../styles/ui.css";
import { buscarDisponibilidad } from "../services/reservaService";
import { validarRangoFechas } from "../validators/validarReservaHabitacion";
import { useNavigate } from "react-router-dom";
import PopupHabitacionNoDisponible from "../components/PopupHabitacionNoDisponible"; // NUEVO
import { parseDdMmYyyy, formatDateFromObj } from "../utils/date";
import { ROOM_TYPES_BY_NUMBER, PRETTY_ROOM_TYPE } from "../constants/roomTypes";
import FechaInvalidaPopup from "../components/FechaInvalidaPopup";
import Modal from "../components/Modal";

// Mapeo nro Habitación (para mostrar tipo en el panel derecho)

// Igual que en CU05: pasa del enum del back a texto legible
const prettyTipoHabitacion = (raw) => {
  const t = String(raw || "").toUpperCase();
  return PRETTY_ROOM_TYPE[t] || raw;
};

const ReservarHabitacionPage = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [grid, setGrid] = useState([]); // [{fecha, habitaciones:[{nro, estado}]}]
  const [columnas, setColumnas] = useState([]); // [{nro:"1-101", tipo:"INDIVIDUAL_ESTANDAR"}, ...]
  const [selectedCells, setSelectedCells] = useState([]); // {fecha, nro}
  const [mensajeSinHabitaciones, setMensajeSinHabitaciones] = useState("");
  const [errorFechas, setErrorFechas] = useState("");
  const [erroresFechas, setErroresFechas] = useState({});
  const [buscando, setBuscando] = useState(false);
  const [showFechasPopup, setShowFechasPopup] = useState(false);
  const [mensajeFechasPopup, setMensajeFechasPopup] = useState("");

  
  const [showNoDispPopup, setShowNoDispPopup] = useState(false);
  const [rangoNoDisp, setRangoNoDisp] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSinDisponibilidadPopup, setShowSinDisponibilidadPopup] = useState(false);

  const navigate = useNavigate();

  // Agrupamos columnas por tipo de Habitación (para header doble como CU05)
  const gruposColumnas = useMemo(() => {
    if (!Array.isArray(columnas) || columnas.length === 0) return [];

    const map = new Map(); // tipo -> [cols]

    columnas.forEach((col) => {
      const tipo = col.tipo || "Tipo";
      if (!map.has(tipo)) {
        map.set(tipo, []);
      }
      const raw = String(col.nro ?? col.numero ?? "");
      const match = raw.match(/(\d+)$/);
      const nroDisplay = match ? match[1] : raw;
      map.get(tipo).push({ ...col, nroDisplay });
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
    setErroresFechas({});
    setShowFechasPopup(false);
    setMensajeFechasPopup("");

    const errs = {};
    if (!fechaDesde) errs.desde = "El campo Desde no puede quedar vacio.";
    if (!fechaHasta) errs.hasta = "El campo Hasta no puede quedar vacio.";

    if (Object.keys(errs).length > 0) {
      setErroresFechas(errs);
      return;
    }

    const hoyIso = new Date().toISOString().slice(0, 10);
    if (fechaDesde < hoyIso) {
      const msg = "No se puede reservar fechas anteriores a hoy.";
      setErrorFechas(msg);
      setMensajeFechasPopup(msg);
      setShowFechasPopup(true);
      return;
    }

    const error = validarRangoFechas(fechaDesde, fechaHasta);
    if (error) {
      setErrorFechas(error);
      setMensajeFechasPopup(error);
      setShowFechasPopup(true);
      return;
    }

    setBuscando(true);
    try {
      const { grid: nuevaGrid, columnas: nuevasCols } =
        await buscarDisponibilidad(fechaDesde, fechaHasta);

      setGrid(nuevaGrid);
      setColumnas(nuevasCols);
      setSelectedCells([]);

      const hayDisponible = nuevaGrid.some((fila) =>
        (fila.habitaciones || []).some((hab) => hab.estado === "disponible")
      );

      const sinDisponibles = !hayDisponible;

      setMensajeSinHabitaciones(
        sinDisponibles
          ? "No hay habitaciones disponibles para el rango seleccionado."
          : ""
      );
      setShowSinDisponibilidadPopup(sinDisponibles);
    } catch (err) {
      console.error(err);
      setMensajeSinHabitaciones(
        "Ocurrió un error al buscar la disponibilidad."
      );
    }
    setBuscando(false);
  };

  // -------------------------------------------------------------------
  // Helpers de selección / estado
  // -------------------------------------------------------------------


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
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate(-1);
  };

  const handleCloseCancelModal = () => setShowCancelModal(false);


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

    const ordenadas = [...new Set(fechasNoDisp)].sort((f1, f2) => {
      const d1 = parseDdMmYyyy(f1);
      const d2 = parseDdMmYyyy(f2);
      return d1 - d2;
    });

    return {
      desde: ordenadas[0],
      hasta: ordenadas[ordenadas.length - 1],
      cantidad: ordenadas.length, 
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


  const handleCloseNoDispPopup = () => {
    setShowNoDispPopup(false);
    setSelectedCells([]); // limpia grilla y panel derecho
  };
  const handleCloseSinDisponibilidad = () => {
    setShowSinDisponibilidadPopup(false);
    navigate("/");
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

            <form className="date-form reserva-form" onSubmit={handleBuscar} noValidate>
              <div className="date-field">
                <label htmlFor="desde">
                  Desde <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="desde"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    if (erroresFechas.desde) {
                      setErroresFechas((prev) => ({ ...prev, desde: "" }));
                    }
                    if (errorFechas) setErrorFechas("");
                  }}
                  required
                  className={erroresFechas.desde ? "inputError" : ""}
                />
                {erroresFechas.desde ? (
                  <div className="fieldError">{erroresFechas.desde}</div>
                ) : (
                  <div className="fieldError fieldErrorSpacer">&nbsp;</div>
                )}
              </div>

              <div className="date-field">
                <label htmlFor="hasta">
                  Hasta <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="hasta"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    if (erroresFechas.hasta) {
                      setErroresFechas((prev) => ({ ...prev, hasta: "" }));
                    }
                    if (errorFechas) setErrorFechas("");
                  }}
                  required
                  className={erroresFechas.hasta ? "inputError" : ""}
                />
                {erroresFechas.hasta ? (
                  <div className="fieldError">{erroresFechas.hasta}</div>
                ) : (
                  <div className="fieldError fieldErrorSpacer">&nbsp;</div>
                )}
              </div>

              <button
                type="submit"
                className={`btnPrimary searchButtonInline ${buscando ? "btnPrimaryDisabled" : ""}`}
                disabled={buscando}
              >
                {buscando ? "Buscando..." : "Buscar habitaciones"}
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
                          <th key={col.nro}>{col.nroDisplay || col.nro}</th>
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
            <button className="btnSecondary" onClick={handleCancelar}>
              Cancelar
            </button>

            <button
              className={`btnPrimary ${reservasAgrupadas.length === 0 ? "btnPrimaryDisabled" : ""}`}
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
          rango={rangoNoDisp}   
          onClose={handleCloseNoDispPopup}
        />
      )}

      <Modal
        open={showSinDisponibilidadPopup}
        title="Error de reserva"
        variant="danger"
        onClose={handleCloseSinDisponibilidad}
        actions={
          <button
            className="btnPrimary"
            onClick={handleCloseSinDisponibilidad}
            type="button"
          >
            Salir
          </button>
        }
      >
        <p>No hay habitaciones disponibles para las fechas seleccionadas.</p>
      </Modal>


      <Modal
        open={showCancelModal}
        title="CANCELAR"
        variant="success"
        onClose={handleCloseCancelModal}
        actions={
          <>
            <button className="btnSecondary" onClick={handleCloseCancelModal} type="button">
              No
            </button>
            <button className="btnPrimary" onClick={handleConfirmCancel} type="button">
              Sí
            </button>
          </>
        }
      >
        <p>¿Desea cancelar la Reserva?</p>
      </Modal>


      <FechaInvalidaPopup
        open={showFechasPopup}
        message={mensajeFechasPopup || "Las fechas ingresadas son inconsistentes. Revise el rango."}
        buttonText="Volver"
        onClose={() => setShowFechasPopup(false)}
      />

    </div>
  );
};

export default ReservarHabitacionPage;









