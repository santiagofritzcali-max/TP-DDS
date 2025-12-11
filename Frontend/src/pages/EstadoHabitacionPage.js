import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // NUEVO
import "../styles/reservarHabitacionStyle.css";
import "../styles/FechaInvalidaPopup.css";
import { obtenerEstadoHabitaciones } from "../services/estadoHabitacionService";
import FechaInvalidaPopup from "../components/FechaInvalidaPopup";



// --- Modal simple (popup) --- // NUEVO
const PopupModal = ({ open, title, children, actions, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          {actions}
          {!actions && (
            <button className="btn-primary" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
  // Soporta: Long/string, o objeto {nroPiso, nroHabitacion}
  if (k && typeof k === "object") {
    const piso = k.nroPiso ?? k.piso;
    const nro = k.nroHabitacion ?? k.nro ?? k.numero;
    if (piso != null && nro != null) return `${piso}-${nro}`;
  }
  return String(k);
};

const estadoToSlug = (estadoRaw) => {
  const s = String(estadoRaw || "").toLowerCase();

  if (s.includes("fuera") || s.includes("no_disponible") || s.includes("no-disponible")) {
    return "fuera-servicio";
  }
  if (s.includes("dispon")) return "disponible";
  if (s.includes("reserv")) return "reservada";
  if (s.includes("ocup")) return "ocupada";

  return "desconocido";
};

const EstadoHabitacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Puede venir de varias formas:
  // - state.desdeCU15 === true  (si navegamos así)
  // - state.modo === 'desdeCU15' (como lo hace HomePage ahora)
  const modo = location.state?.modo || null;
  const desdeCU15 =
    location.state?.desdeCU15 === true || modo === "desdeCU15";


  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [erroresFechas, setErroresFechas] = useState({});

  const [gridData, setGridData] = useState(null); // backend raw
  const [errorFechas, setErrorFechas] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // NUEVO: selección de habitación + días (solo cuando viene desde CU15)
  const [seleccion, setSeleccion] = useState(null);
  // seleccion = { habitacionId, habitacionLabel, dias: [ "YYYY-MM-DD", ... ] }

  // NUEVO: estado para popup
  const [popup, setPopup] = useState({ open: false, type: null, data: null });

  // NUEVO: popup para fechas inválidas
  const [fechaPopup, setFechaPopup] = useState({ open: false, message: "" });

  const [seleccionExitosa, setSeleccionExitosa] = useState({
    open: false,
    payload: null,
  });
  const seleccionExitosaHandledRef = useRef(false);

  const abrirFechaPopup = (msg) => {
    setErrorFechas(msg); // mantenés el texto rojo como antes
    setFechaPopup({ open: true, message: msg });
  };

  const cerrarFechaPopup = () => setFechaPopup({ open: false, message: "" });

  // NUEVO: cancelar a pantalla principal
  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setSeleccion(null);
    setGridData(null);
    setMensaje("");
    navigate("/"); // ajustá si tu "principal" es otra ruta
  };

  const handleCloseCancelModal = () => setShowCancelModal(false);

  const cerrarPopup = () => setPopup({ open: false, type: null, data: null });

  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorFechas("");
    setMensaje("");
    setSeleccion(null); // NUEVO: limpiar selección al buscar de nuevo
    setErroresFechas({});

    const errs = {};
    if (!fechaDesde) errs.desde = "El campo Desde no puede quedar vacío.";
    if (!fechaHasta) errs.hasta = "El campo Hasta no puede quedar vacío.";
    if (Object.keys(errs).length > 0) {
      setErroresFechas(errs);
      setErrorFechas("");
      return;
    }

    if (fechaHasta < fechaDesde) {
      abrirFechaPopup("'Hasta' no puede ser anterior a 'Desde'.");
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

    const grupos = gruposRaw.map((g) => {
      const tipo = g.tipoHabitacion ?? g.tipo ?? g.tipoDeHabitacion ?? "Tipo";
      const habitaciones = Array.isArray(g.habitaciones) ? g.habitaciones : [];

      const cols = habitaciones.map((h) => {
        const id = h.id ?? h.habitacionId ?? h.key ?? h;
        const numero = h.numero ?? h.nro ?? h.label ?? String(id);
        const display = String(numero);

        return { id: keyToString(id), display };
      });

      return { tipo: prettyTipoHabitacion(tipo), cols };
    });

    const columnOrder = grupos.flatMap((g) => g.cols);

    const rows = filasRaw.map((f) => {
      const diaIso = f.dia ?? f.fecha ?? f.day;
      const celdas = Array.isArray(f.celdas) ? f.celdas : [];

      const cells = columnOrder.map((col) => {
        // Buscamos la celda del backend correspondiente a esta columna
        const celdaRaw = celdas.find((c) => {
          const id = c.habitacionId ?? c.id ?? c.key ?? c;
          return keyToString(id) === col.id;
        });

        const estado = celdaRaw?.estado;
        const slug = estadoToSlug(estado);

        return {
          slug,
          title: `Hab ${col.display} - ${estado ?? "Sin estado"}`,
          raw: celdaRaw || null, // <-- guardamos la celda completa
        };
      });

      return { diaIso: String(diaIso || ""), diaLabel: formatDia(diaIso), cells };
    });

    return { grupos, columnOrder, rows };
  }, [gridData]);

  // NUEVO: helper para saber si una celda está seleccionada
  const estaSeleccionada = (habitacionId, diaIso) => {
    if (!seleccion) return false;
    if (seleccion.habitacionId !== habitacionId) return false;
    return seleccion.dias.includes(diaIso);
  };

  // NUEVO: click en celda (solo si viene desde CU15)
  const handleCellClick = (diaIso, habitacionId, habitacionLabel) => {
    if (!desdeCU15) return;
    if (!diaIso || !habitacionId) return;

    setSeleccion((prev) => {
      // si es la primera selección o cambia de habitación -> reseteamos a esa sola celda
      if (!prev || prev.habitacionId !== habitacionId) {
        return {
          habitacionId,
          habitacionLabel,
          dias: [diaIso],
        };
      }

      // misma habitación: agregamos / quitamos día
      const yaEsta = prev.dias.includes(diaIso);
      if (yaEsta) {
        const nuevas = prev.dias.filter((d) => d !== diaIso);
        if (nuevas.length === 0) {
          return null;
        }
        nuevas.sort();
        return { ...prev, dias: nuevas };
      } else {
        const nuevas = [...prev.dias, diaIso].sort();
        return { ...prev, dias: nuevas };
      }
    });
  };

  // NUEVO: rango seleccionado (min / max fecha)
  const rangoSeleccionado = useMemo(() => {
    if (!seleccion || !seleccion.dias || seleccion.dias.length === 0) return null;
    const ordenadas = [...seleccion.dias].sort();
    return { desde: ordenadas[0], hasta: ordenadas[ordenadas.length - 1] };
  }, [seleccion]);

  // NUEVO: manejar "Continuar con ocupación (CU-15)"
  const handleContinuarCU15 = () => {
    if (!desdeCU15 || !normalized || !seleccion || !rangoSeleccionado) return;

    const habitacionIndex = normalized.columnOrder.findIndex(
      (c) => c.id === seleccion.habitacionId
    );
    if (habitacionIndex === -1) return;

    const estadosEnRango = seleccion.dias.map((diaIso) => {
      const row = normalized.rows.find((r) => r.diaIso === diaIso);
      const cell = row?.cells?.[habitacionIndex];
      return {
        diaIso,
        slug: cell?.slug ?? "desconocido",
      };
    });

    if (estadosEnRango.length === 0) {
      // Caso borde, casi imposible si ya pudo seleccionar
      setPopup({
        open: true,
        type: "sin-habitaciones",
        data: { rango: rangoSeleccionado },
      });
      return;
    }

    const hayOcupadaOServicio = estadosEnRango.some(
      (c) => c.slug === "ocupada" || c.slug === "fuera-servicio"
    );
    if (hayOcupadaOServicio) {
      // Caso 2: ocupada / fuera de servicio
      setPopup({
        open: true,
        type: "bloqueo-ocupada",
        data: { rango: rangoSeleccionado },
      });
      return;
    }

    const hayReservada = estadosEnRango.some((c) => c.slug === "reservada");
    if (hayReservada) {
      // Caso 3: reservada -> mostrar popup con opciones
      setPopup({
        open: true,
        type: "reservada-conflicto",
        data: { rango: rangoSeleccionado },
      });
      return;
    }

    // Caso 4: todas disponibles -> seguir sin conflicto

    setSeleccionExitosa({
      open: true,
      payload: {
        desdeCU15: true,
        numeroHabitacion: seleccion.habitacionId,
        fechaIngreso: rangoSeleccionado.desde,
        fechaEgreso: rangoSeleccionado.hasta,
        ocupaSobreReserva: false,
      },
    });

  };

  useEffect(() => {
    if (!seleccionExitosa.open) {
      seleccionExitosaHandledRef.current = false;
      return;
    }

    const handleKeyDown = () => {
      if (seleccionExitosaHandledRef.current) return;
      seleccionExitosaHandledRef.current = true;

      const payload = seleccionExitosa.payload;
      setSeleccionExitosa({ open: false, payload: null });

      if (payload) {
        navigate("/cu15", { state: payload });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [seleccionExitosa, navigate]);

  // NUEVO: contenido del popup según tipo
  let popupTitle = "";
  let popupBody = null;
  let popupActions = null;

  if (popup.open) {
    const rango = popup.data?.rango;
    const rangoTexto =
      rango ? `${formatDia(rango.desde)} al ${formatDia(rango.hasta)}` : "";

    switch (popup.type) {
      case "bloqueo-ocupada":
        popupTitle = "Rango no válido";
        popupBody = (
          <p>
            En el rango seleccionado ({rangoTexto}) hay días donde la habitación
            está <strong>ocupada</strong> o <strong>fuera de servicio</strong>.
            Por favor seleccione otro rango de fechas.
          </p>
        );
        popupActions = (
          <button className="btn-primary" onClick={cerrarPopup}>
            Aceptar
          </button>
        );
        break;

      case "reservada-conflicto": {
        const rango = popup.data?.rango;
        const rangoTexto =
          rango ? `${formatDia(rango.desde)} al ${formatDia(rango.hasta)}` : "";

        // Armamos el detalle de las reservas en ese rango
        let reservasDetalle = [];
        if (normalized && seleccion && rango) {
          const habIndex = normalized.columnOrder.findIndex(
            (c) => c.id === seleccion.habitacionId
          );

          if (habIndex !== -1) {
            reservasDetalle = normalized.rows
              .filter((r) => r.diaIso >= rango.desde && r.diaIso <= rango.hasta)
              .map((r) => {
                const cell = r.cells[habIndex];
                if (!cell || cell.slug !== "reservada" || !cell.raw) return null;

                const raw = cell.raw;
                const info = raw.reservaInfo || {};

                const apellido =
                  info.apellido ?? raw.apellidoHuesped ?? raw.apellidoTitular ?? raw.huespedPrincipal?.apellido ?? "";
                const nombre =
                  info.nombre ?? raw.nombreHuesped ?? raw.nombreTitular ?? raw.huespedPrincipal?.nombre ?? "";
                const telefono = info.telefono ?? raw.telefono ?? raw.huespedPrincipal?.telefono ?? "";
                const docTipo = raw.tipoDoc ?? raw.huespedPrincipal?.tipoDoc ?? "";
                const docNro = raw.nroDoc ?? raw.huespedPrincipal?.nroDoc ?? "";

                const baseNombre = apellido || nombre ? `${apellido}, ${nombre}` : "";
                const contacto = telefono ? ` - ${telefono}` : "";
                const doc = docTipo || docNro ? ` (${docTipo} ${docNro})` : "";

                const descripcion =
                  baseNombre || contacto || doc
                    ? `${baseNombre}${contacto}${doc}`
                    : "Reserva sin titular informado.";

                return {
                  diaIso: r.diaIso,
                  descripcion,
                };
              })
              .filter(Boolean);
          }
        }

        popupTitle = "Habitación reservada";
        popupBody = (
          <>
            <p>
              En el rango seleccionado ({rangoTexto}) hay días donde la
              habitación está <strong>reservada</strong>.
            </p>

            {reservasDetalle.length > 0 && (
              <>
                <p>Detalle de reservas en el rango:</p>
                <ul>
                  {reservasDetalle.map((r) => (
                    <li key={r.diaIso}>
                      Día {formatDia(r.diaIso)} - {r.descripcion}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p>
              ¿Desea <strong>ocupar igualmente</strong> la habitación en esas
              fechas o prefiere volver a la grilla?
            </p>
          </>
        );
        popupActions = (
          <>
            <button className="btn-secondary" onClick={cerrarPopup}>
              Volver
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                cerrarPopup();
                navigate("/cu15", {
                  state: {
                    desdeCU15: true,
                    numeroHabitacion: seleccion?.habitacionId,
                    fechaIngreso: rango?.desde,
                    fechaEgreso: rango?.hasta,
                    ocupaSobreReserva: true,
                  },
                });
              }}
            >
              Ocupar igualmente
            </button>
          </>
        );
        break;
      }


      case "sin-habitaciones":
        popupTitle = "Sin habitaciones válidas";
        popupBody = (
          <p>
            No se encontraron habitaciones válidas para el rango seleccionado.
          </p>
        );
        popupActions = (
          <button className="btn-primary" onClick={cerrarPopup}>
            Aceptar
          </button>
        );
        break;

      default:
        popupTitle = "Mensaje";
        popupBody = <p>Ocurrió una condición no manejada.</p>;
        popupActions = (
          <button className="btn-primary" onClick={cerrarPopup}>
            Cerrar
          </button>
        );
        break;
    }
  }

  return (
    <div className="reserva-page">
      <FechaInvalidaPopup
        open={fechaPopup.open}
        message={fechaPopup.message}
        onClose={cerrarFechaPopup}
      />
      <main className="main-layout">
        <section className="left-panel">
          <section className="reservation-search estado-search">
            <h1 className="section-title">
              Estado de Habitaciones (CU-05{desdeCU15 ? " / CU-15" : ""})
            </h1>

            <form className="date-form" onSubmit={handleBuscar} noValidate>
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
                  }}
                  className={erroresFechas.desde ? "inputError" : ""}
                />
                {erroresFechas.desde && (
                  <div className="fieldError">{erroresFechas.desde}</div>
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
                  }}
                  className={erroresFechas.hasta ? "inputError" : ""}
                />
                {erroresFechas.hasta && (
                  <div className="fieldError">{erroresFechas.hasta}</div>
                )}
              </div>

              <div className="actionsSearch">
                <button
                  type="submit"
                  className={`btnPrimary ${loading ? "btnPrimaryDisabled" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Buscando..." : "Buscar estado"}
                </button>
              </div>
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
                      {r.cells.map((cell, idx) => {
                        const col = normalized.columnOrder[idx];
                        const habId = col.id;
                        const selected = estaSeleccionada(habId, r.diaIso);

                        const baseClass = `cell estado-${cell.slug} ${desdeCU15 ? "cell-selectable" : "cell-readonly"
                          }`;

                        const className = selected
                          ? `${baseClass} cell-selected`
                          : baseClass;

                        return (
                          <td
                            key={`${r.diaIso}-${idx}`}
                            className={className}
                            title={cell.title}
                            onClick={
                              desdeCU15
                                ? () =>
                                  handleCellClick(
                                    r.diaIso,
                                    habId,
                                    col.display
                                  )
                                : undefined
                            }
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mensaje && <p className="no-rooms-message">{mensaje}</p>}

            {/* NUEVO: panel de selección sólo cuando viene desde CU15 */}
            {desdeCU15 && (
              <div className="seleccion-cu15-panel">
                <button
                  type="button"
                  className={`btnPrimary ${!rangoSeleccionado ? "btnPrimaryDisabled" : ""}`}
                  disabled={!rangoSeleccionado}
                  onClick={handleContinuarCU15}
                >
                  Continuar ocupación
                </button>
              </div>
            )}
          </section>

          <div className="cancelBottomLeft">
            <button
              type="button"
              className="btnSecondary"
              onClick={handleCancelar}
            >
              Cancelar
            </button>
          </div>
        </section>
      </main>

      {/* NUEVO: popup para conflictos / mensajes del CU15 */}
      <PopupModal
        open={popup.open}
        title={popupTitle}
        onClose={cerrarPopup}
        actions={popupActions}
      >
        {popupBody}
      </PopupModal>

      {showCancelModal && (
        <div className="modalOverlay">
          <div className="modalContent modalCancel">
            <div className="modalTitle modalCancelTitle">CANCELAR</div>
            <div className="modalBody modalCancelBody">
              <p>¿Desea cancelar la operación?</p>
            </div>
            <div className="modalButtons modalCancelButtons">
              <button
                className="modalButtonBase modalButtonSecondary"
                onClick={handleCloseCancelModal}
                type="button"
              >
                No
              </button>
              <button
                className="modalButtonBase modalButtonPrimary"
                onClick={handleConfirmCancel}
                type="button"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}

      {seleccionExitosa.open && (
        <div className="modalOverlay">
          <div className="modalSuccessCu05">
            <div className="modalTitleSuccessCu05">SELECCION EXITOSA</div>
            <div className="modalBodySuccessCu05">
              <p>PRESIONE CUALQUIER TECLA Y CONTINUA...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadoHabitacionPage;
