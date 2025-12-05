import React, { useState } from "react";
import "../styles/reservaHabitacionStyle.css";
import { buscarDisponibilidad } from "../services/reservaService"; 
import { validarRangoFechas } from "../validators/validarReservaHabitacion";

// Mapeo nro habitación → tipo
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

// Grilla inicial (mock similar al mockup)
const INITIAL_GRID = [
  {
    fecha: "28/04",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "ocupada" },
      { nro: "404", estado: "no-disponible" },
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
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "30/04",
    habitaciones: [
      { nro: "101", estado: "ocupada" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
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
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "03/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "reservada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "04/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "reservada" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "05/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "disponible" },
      { nro: "500", estado: "ocupada" }
    ]
  }
];

const ReservaHabitacionPage = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [grid, setGrid] = useState(INITIAL_GRID);
  const [selectedCells, setSelectedCells] = useState([]); // {fecha, nro}
  const [mensajeSinHabitaciones, setMensajeSinHabitaciones] = useState("");
  const [errorFechas, setErrorFechas] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorFechas("");

    const error = validarRangoFechas(fechaDesde, fechaHasta);
    if (error) {
      setErrorFechas(error);
      return;
    }

    try {
      // llamada al backend (por ahora mock interno en reservaService)
      const nuevaGrid = await buscarDisponibilidad(fechaDesde, fechaHasta);

      setGrid(nuevaGrid);
      setSelectedCells([]);
      setMensajeSinHabitaciones(
        nuevaGrid.length === 0 ? "No hay habitaciones disponibles para el rango seleccionado." : ""
      );
    } catch (err) {
      console.error(err);
      setMensajeSinHabitaciones("Ocurrió un error al buscar la disponibilidad.");
    }
  };

  const toggleCell = (fecha, nro, estado) => {
    if (estado !== "disponible") return;

    const key = `${fecha}-${nro}`;
    const yaSeleccionada = selectedCells.some((c) => `${c.fecha}-${c.nro}` === key);

    if (yaSeleccionada) {
      setSelectedCells(selectedCells.filter((c) => `${c.fecha}-${c.nro}` !== key));
    } else {
      setSelectedCells([...selectedCells, { fecha, nro }]);
    }
  };

  const handleCancelar = () => {
    setSelectedCells([]);
  };

  const handleSiguiente = () => {
    // Aquí se integraría con el siguiente paso del CU-04 (por ej. navegación a AltaHuespedPage)
    console.log("Habitaciones seleccionadas:", selectedCells);
    alert("Aquí se debería continuar con el siguiente paso del CU-04 (datos del huésped).");
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
            <h2 className="section-subtitle">Habitaciones</h2>

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
                <span className="legend-color estado-no-disponible" />
                <span>No disponible</span>
              </div>
            </div>

            <div className="grid-container">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th className="col-dia">Días de</th>
                    <th>Individual Estándar</th>
                    <th>Doble Estándar</th>
                    <th>Doble Superior</th>
                    <th>Superior Family</th>
                    <th>Suite</th>
                  </tr>
                </thead>
                <tbody>
                  {grid.map((fila) => (
                    <tr key={fila.fecha}>
                      <td className="dia-label">{fila.fecha}</td>
                      {fila.habitaciones.map((hab, index) => {
                        const clases = [
                          "cell",
                          `estado-${hab.estado}`,
                          estaSeleccionada(fila.fecha, hab.nro) ? "cell-seleccionada" : ""
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
          <h2 className="section-subtitle">Habitaciones a Reservar</h2>

          <div className="selected-rooms-list">
            {habitacionesOrdenadas.length === 0 ? (
              <p className="text-empty-right">
                No hay habitaciones seleccionadas.
              </p>
            ) : (
              habitacionesOrdenadas.map((item, idx) => {
                const tipo =
                  ROOM_TYPES_BY_NUMBER[item.nro] || `Habitación ${item.nro}`;
                const fechaIngreso = item.fecha;
                const fechaEgreso = item.fecha; // placeholder, se ajustará con la lógica real

                return (
                  <div className="selected-room-item" key={`${item.fecha}-${item.nro}-${idx}`}>
                    <div className="selected-room-type">
                      Tipo de habitación: {tipo}
                    </div>
                    <div className="selected-room-line">
                      Ingreso: {fechaIngreso}, 13:00 hs
                    </div>
                    <div className="selected-room-line">
                      Egreso: {fechaEgreso}, 8 hs
                    </div>
                  </div>
                );
              })
            )}
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

export default ReservaHabitacionPage;
