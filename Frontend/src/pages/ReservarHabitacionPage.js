import React, { useState } from "react";
import "../styles/reservarHabitacionStyle.css";
import { buscarDisponibilidad } from "../services/reservaService";
import { validarRangoFechas } from "../validators/validarReservaHabitacion";
import { useNavigate } from "react-router-dom";

// Mapeo nro habitación
const ROOM_TYPES_BY_NUMBER = {
  "101": "Individual Estándar",
  "102": "Individual Estándar",
  "201": "Doble Estándar",
  "203": "Doble Estándar",
  "301": "Doble Superior",
  "302": "Doble Superior",
  "404": "Superior Family",
  "500": "Suite"
};

// Grilla inicial (solo placeholder visual)
const INITIAL_GRID = [
  {
    fecha: "28/04",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "ocupada" },
      { nro: "404", estado: "fuera-servicio" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "29/04",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "reservada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "fuera-servicio" }
    ]
  },
  {
    fecha: "30/04",
    habitaciones: [
      { nro: "101", estado: "ocupada" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "fuera-servicio" }
    ]
  },
  {
    fecha: "01/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "reservada" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "02/05",
    habitaciones: [
      { nro: "101", estado: "reservada" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "ocupada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "fuera-servicio" }
    ]
  }
];

const ReservarHabitacionPage = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [grid, setGrid] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]); // {fecha, nro}
  const [mensajeSinHabitaciones, setMensajeSinHabitaciones] = useState("");
  const [errorFechas, setErrorFechas] = useState("");

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
      const { grid: nuevaGrid, columnas: nuevasCols } = await buscarDisponibilidad(fechaDesde, fechaHasta);
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
      setMensajeSinHabitaciones("Ocurrió un error al buscar la disponibilidad.");
    }
  };

  const toggleCell = (fecha, nro, estado) => {
    if (estado !== "disponible") return;

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
    setSelectedCells([]);
  };

  const navigate = useNavigate();
  const handleSiguiente = () => {
    if (habitacionesOrdenadas.length === 0) return;

    navigate("/datos-reserva", {
      state: {
        fechaDesde,
        fechaHasta,
        habitaciones: habitacionesOrdenadas.map((h) => ({
          fecha: h.fecha,
          nro: h.nro,
          tipo: columnas.find((c) => c.nro === h.nro)?.tipo || `Habitación ${h.nro}`,
          fechaIngreso: h.fecha,
          fechaEgreso: h.fecha,
        })),
      },
    });
  };

  const estaSeleccionada = (fecha, nro) =>
    selectedCells.some((c) => c.fecha === fecha && c.nro === nro);

  const habitacionesOrdenadas = [...selectedCells].sort((a, b) => {
    const ka = `${a.fecha}-${a.nro}`;
    const kb = `${b.fecha}-${b.nro}`;
    return ka.localeCompare(kb);
  });

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
                  <tr>
                    <th className="col-dia">Días de</th>
                    {columnas.length > 0
                      ? columnas.map((col) => (
                        <th key={col.nro}>{col.tipo || col.nro}</th>
                      ))
                      : (
                        <>
                          <th>Individual Estándar</th>
                          <th>Doble Estándar</th>
                          <th>Doble Superior</th>
                          <th>Superior Family</th>
                          <th>Suite</th>
                        </>
                      )}
                  </tr>
                </thead>

                <tbody>
                  {grid.map((fila, rowIndex) => (
                    <tr key={fila.fecha}>
                      <td className="dia-label">{fila.fecha}</td>

                      {fila.habitaciones.map((hab, index) => {
                        const seleccion = estaSeleccionada(fila.fecha, hab.nro);

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
                            onClick={() => toggleCell(fila.fecha, hab.nro, hab.estado)}
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
              {habitacionesOrdenadas.length === 0 ? (
                <p className="text-empty-right">No hay habitaciones seleccionadas.</p>
              ) : (
                habitacionesOrdenadas.map((item, idx) => {
                  const tipo = ROOM_TYPES_BY_NUMBER[item.nro] || `Habitación ${item.nro}`;
                  return (
                    <div className="selected-room-item" key={idx}>
                      <div className="selected-room-type">Tipo de habitación: {tipo}</div>
                      <div className="selected-room-line">Ingreso: {item.fecha}, 13:00 hs</div>
                      <div className="selected-room-line">Egreso: {item.fecha}, 8 hs</div>
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
              disabled={habitacionesOrdenadas.length === 0}
            >
              Siguiente
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ReservarHabitacionPage;
