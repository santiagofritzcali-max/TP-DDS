import React, { useMemo, useState } from "react";
import "../styles/reservarHabitacionStyle.css";  
import { obtenerEstadoHabitaciones } from "../services/estadoHabitacionService";

// --- Helpers ---
const formatDia = (isoDate) => {
  // "YYYY-MM-DD" => "DD/MM"
  if (!isoDate) return "";
  const [y, m, d] = String(isoDate).split("-");
  if (!y || !m || !d) return String(isoDate);
  return `${d}/${m}`;
};

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

const keyToString = (k) => {
  // Soporta: Long/string, o objeto {nroPiso, nroHabitacion} (por si tu DTO es compuesto)
  if (k && typeof k === "object") {
    const piso = k.nroPiso ?? k.piso;
    const nro = k.nroHabitacion ?? k.nro ?? k.numero;
    if (piso != null && nro != null) return `${piso}-${nro}`;
  }
  return String(k);
};

const estadoToSlug = (estadoRaw) => {
  const s = String(estadoRaw || "").toLowerCase();

  // contemplamos variantes viejas/nuevas
  if (s.includes("fuera") || s.includes("no_disponible") || s.includes("no-disponible")) {
    return "fuera-servicio";
  }
  if (s.includes("dispon")) return "disponible";
  if (s.includes("reserv")) return "reservada";
  if (s.includes("ocup")) return "ocupada";

  return "desconocido";
};

const EstadoHabitacionPage = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [gridData, setGridData] = useState(null); // backend raw
  const [errorFechas, setErrorFechas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorFechas("");
    setMensaje("");

    if (!fechaDesde || !fechaHasta) {
      setErrorFechas("Las fechas 'Desde' y 'Hasta' son obligatorias.");
      return;
    }
    if (fechaHasta < fechaDesde) {
      setErrorFechas("'Hasta' no puede ser anterior a 'Desde'.");
      return;
    }

    try {
      setLoading(true);
      const data = await obtenerEstadoHabitaciones(fechaDesde, fechaHasta);
      setGridData(data);

      const sinGrupos = !data?.grupos || data.grupos.length === 0;
      const sinFilas = !data?.filas || data.filas.length === 0;

      setMensaje(
        sinGrupos || sinFilas
          ? "No hay habitaciones para mostrar en el rango seleccionado."
          : ""
      );
    } catch (err) {
      console.error(err);
      setMensaje("Ocurrió un error al obtener el estado de las habitaciones.");
    } finally {
      setLoading(false);
    }
  };

  // Normalizamos el response a columnas + filas (para pintar la tabla)
  const normalized = useMemo(() => {
    if (!gridData) return null;

    const gruposRaw = Array.isArray(gridData.grupos) ? gridData.grupos : [];
    const filasRaw = Array.isArray(gridData.filas) ? gridData.filas : [];

    // grupos: [{ tipoHabitacion, habitaciones:[{id, numero}]}] :contentReference[oaicite:3]{index=3}
    const grupos = gruposRaw.map((g) => {
      const tipo = g.tipoHabitacion ?? g.tipo ?? g.tipoDeHabitacion ?? "Tipo";
      const habitaciones = Array.isArray(g.habitaciones) ? g.habitaciones : [];

      const cols = habitaciones.map((h) => {
        // DTO original: { id, numero } :contentReference[oaicite:4]{index=4}
        const id = h.id ?? h.habitacionId ?? h.key ?? h;
        const numero = h.numero ?? h.nro ?? h.label ?? String(id);

        // si viene "1-101" y vos querés ver solo "101", descomentá:
        // const display = String(numero).includes("-") ? String(numero).split("-")[1] : String(numero);
        const display = String(numero);

        return { id: keyToString(id), display };
      });

      return { tipo: prettyTipoHabitacion(tipo), cols };
    });

    const columnOrder = grupos.flatMap((g) => g.cols);

    // Mapa de celdas por fila (por id)
    const rows = filasRaw.map((f) => {
      const diaIso = f.dia ?? f.fecha ?? f.day;
      const celdas = Array.isArray(f.celdas) ? f.celdas : [];

      const mapEstadoPorId = new Map(
        celdas.map((c) => {
          const id = c.habitacionId ?? c.id ?? c.key ?? c;
          return [keyToString(id), c.estado];
        })
      );

      const cells = columnOrder.map((col) => {
        const estado = mapEstadoPorId.get(col.id);
        const slug = estadoToSlug(estado);
        return {
          slug,
          title: `Hab ${col.display} - ${estado ?? "Sin estado"}`,
        };
      });

      return { diaIso: String(diaIso || ""), diaLabel: formatDia(diaIso), cells };
    });

    return { grupos, columnOrder, rows };
  }, [gridData]);

  return (
    <div className="reserva-page">
      <main className="main-layout">
        <section className="left-panel">
          <section className="reservation-search">
            <h1 className="section-title">Estado de Habitaciones (CU-05)</h1>

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

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Buscando..." : "Buscar estado"}
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
              <table className="rooms-table estado-grid">
                <thead>
                  <tr>
                    <th className="col-dia" rowSpan={2}>
                      Días
                    </th>

                    {normalized?.grupos?.map((g) => (
                      <th key={g.tipo} colSpan={g.cols.length}>
                        {g.tipo}
                      </th>
                    ))}
                  </tr>

                  <tr>
                    {normalized?.columnOrder?.map((c) => (
                      <th key={c.id}>{c.display}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {normalized?.rows?.map((r) => (
                    <tr key={r.diaIso || r.diaLabel}>
                      <td className="dia-label">{r.diaLabel}</td>
                      {r.cells.map((cell, idx) => (
                        <td
                          key={`${r.diaIso}-${idx}`}
                          className={`cell cell-readonly estado-${cell.slug}`}
                          title={cell.title}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mensaje && <p className="no-rooms-message">{mensaje}</p>}
          </section>
        </section>
      </main>
    </div>
  );
};

export default EstadoHabitacionPage;