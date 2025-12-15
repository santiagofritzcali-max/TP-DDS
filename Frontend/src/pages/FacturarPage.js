import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import {
  buscarOcupantes,
  prepararFactura,
  generarFactura,
} from "../services/facturacionService";
import { buscarHuespedes } from "../services/huespedService";
import { buscarResponsables } from "../services/responsablePagoService";
import Modal from "../components/Modal";

const FacturarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [fechaEgreso, setFechaEgreso] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [ocupantes, setOcupantes] = useState([]);
  const [estadiaId, setEstadiaId] = useState(null);
  const [seleccionResponsable, setSeleccionResponsable] = useState(null); // {tipo:'huesped', value:HuespedIdDTO} | {tipo:'tercero', value:cuit}
  const [cuitTercero, setCuitTercero] = useState("");
  const [error, setError] = useState(null);
  const [step, setStep] = useState("buscar");

  const [preview, setPreview] = useState(null);
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [previsualizando, setPrevisualizando] = useState(false);
  const [facturaFinal, setFacturaFinal] = useState(null);
  const [pendingSeleccion, setPendingSeleccion] = useState(null); // {tipoDoc, nroDoc}
  const [previewPendiente, setPreviewPendiente] = useState(null); // guardamos previsualización a la espera de confirmación
  const [fieldErrors, setFieldErrors] = useState({});
  const nroHabitacionRef = useRef(null);
  const fechaEgresoRef = useRef(null);

  const [errorModal, setErrorModal] = useState(null);
  const [altaModal, setAltaModal] = useState(null); // {message, prefill}
  const [successModal, setSuccessModal] = useState(null);
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [confirmResponsable, setConfirmResponsable] = useState(null); // {nombre, cuit, payloadOverride}

  const normalizeCuitDigits = (raw = "") => raw.replace(/\D/g, "").slice(0, 11);
  const formatCuit = (digits = "") => {
    if (digits.length !== 11) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  };
  const formatIVA = (valor = "") => valor.replace(/([a-z])([A-Z])/g, "$1 $2");

  const buscarResponsablePorCuit = async (digits, formatted) => {
    const variantes = Array.from(new Set([digits, formatted, formatCuit(digits)].filter(Boolean)));
    for (const c of variantes) {
      try {
        const resp = await buscarResponsables({ cuit: c });
        if (resp.ok && Array.isArray(resp.data) && resp.data.length > 0) return resp.data[0];
      } catch (_) { }
    }
    return null;
  };


  const dedupeItems = (items = []) => {
    const map = new Map();
    items.forEach((it) => {
      if (it?.id && !map.has(it.id)) map.set(it.id, it);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const reintentar = location.state?.reintentar;
    if (reintentar) {
      setNumeroHabitacion(reintentar.numeroHabitacion || "");
      setFechaEgreso(reintentar.fechaEgreso || "");
      if (reintentar.huesped) {
        setPendingSeleccion(reintentar.huesped);
      }
      // limpiamos el state para no re-disparar
      navigate(location.pathname, { replace: true, state: {} });
      if (reintentar.numeroHabitacion && reintentar.fechaEgreso) {
        setTimeout(() => {
          handleBuscar();
        }, 0);
      }
    }
  }, [location.state, navigate, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuscar = async () => {
    setError(null);
    setFieldErrors({});
    setOcupantes([]);
    setSeleccionResponsable(null);
    setPreview(null);
    setFacturaFinal(null);
    setMostrandoResultados(false);

    const nuevosErrores = {};
    if (!numeroHabitacion) nuevosErrores.numeroHabitacion = "Ingrese el número de habitación.";
    if (!fechaEgreso) nuevosErrores.fechaEgreso = "Ingrese la fecha de salida.";
    if (Object.keys(nuevosErrores).length > 0) {
      setFieldErrors(nuevosErrores);
      if (nuevosErrores.numeroHabitacion && nroHabitacionRef.current) {
        nroHabitacionRef.current.focus();
      } else if (nuevosErrores.fechaEgreso && fechaEgresoRef.current) {
        fechaEgresoRef.current.focus();
      }
      return;
    }
    const nro = parseInt(numeroHabitacion, 10);
    const nroHabitacionBase = isNaN(nro) ? numeroHabitacion : nro;
    const fechaBusqueda = fechaEgreso.includes("T") ? fechaEgreso.split("T")[0] : fechaEgreso;

    setBuscando(true);
    const { ok, data, error: err } = await buscarOcupantes(
      nroHabitacionBase,
      fechaBusqueda
    );
    setBuscando(false);
    setMostrandoResultados(true);

    if (!ok) {
      const lower = (err || "").toLowerCase();
      let mensaje = err || "No se pudo buscar ocupantes.";
      if (lower.includes("no se encuentra") || lower.includes("no existe estad")) {
        mensaje = `No existe estadía en la habitación ${numeroHabitacion}`;
      } else if (lower.includes("errores en los datos de búsqueda")) {
        mensaje = `No existe estadía en la habitación ${numeroHabitacion}`;
      }
      setErrorModal(mensaje);
      return;
    }

    setEstadiaId(data.estadiaId);
    setOcupantes(data.ocupantes || []);
    if (pendingSeleccion && data.ocupantes) {
      const match = data.ocupantes.find(
        (o) =>
          o.huespedId?.nroDoc === pendingSeleccion.nroDoc &&
          o.huespedId?.tipoDoc === pendingSeleccion.tipoDoc
      );
      if (match) {
        setSeleccionResponsable({ tipo: "huesped", value: match.huespedId });
      }
      setPendingSeleccion(null);
    }
  };

  const handleSeleccionHuesped = (huespedId) => {
    setSeleccionResponsable({ tipo: "huesped", value: huespedId });
    setCuitTercero("");
  };

  const handleSeleccionTercero = (checked) => {
    if (!checked) {
      setSeleccionResponsable(null);
      setCuitTercero("");
      return;
    }
    setSeleccionResponsable({ tipo: "tercero", value: formatCuit(cuitTercero) });
  };

  const doPrevisualizacion = async (payload, forzarConfirmacionTercero = false) => {
    const { ok, data, error: err } = await prepararFactura(payload);
    if (!ok) {
      if (
        payload.huespedResponsable &&
        typeof err === "string" &&
        err.toLowerCase().includes("responsable de pago")
      ) {
        const huespedSel = ocupantes.find(
          (o) =>
            o.huespedId?.nroDoc === payload.huespedResponsable?.nroDoc &&
            o.huespedId?.tipoDoc === payload.huespedResponsable?.tipoDoc
        );
        let prefill = {
          tipoDoc: huespedSel?.huespedId?.tipoDoc,
          nroDoc: huespedSel?.huespedId?.nroDoc,
          nombreCompleto: huespedSel?.nombreCompleto,
        };
        if (huespedSel?.huespedId?.tipoDoc && huespedSel?.huespedId?.nroDoc) {
          try {
            const { data: detalle } = await buscarHuespedes({
              tipoDoc: huespedSel.huespedId.tipoDoc,
              nroDoc: huespedSel.huespedId.nroDoc,
            });
            const h = Array.isArray(detalle) ? detalle[0] : null;
            if (h) {
              prefill = {
                ...prefill,
                razonSocial: `${h.nombre || ""} ${h.apellido || ""}`.trim() || huespedSel?.nombreCompleto,
                cuit: h.cuit || prefill.cuit,
                posicionIVA: h.posicionIVA || "",
                telefono: h.telefono || "",
                direccion: {
                  calle: h.direccion?.calle || "",
                  numero: h.direccion?.numero || "",
                  departamento: h.direccion?.departamento || "",
                  piso: h.direccion?.piso || "",
                  codigoPostal: h.direccion?.codigoPostal || "",
                  localidad: h.direccion?.localidad || "",
                  ciudad: h.direccion?.ciudad || "",
                  provincia: h.direccion?.provincia || "",
                  pais: h.direccion?.pais || "",
                },
              };
            }
          } catch (_) {
            // si falla la búsqueda, seguimos con los datos que tenemos
          }
        }
        setAltaModal({
          message: err,
          prefill,
        });
      } else if (
        payload.cuitTercero &&
        typeof err === "string" &&
        err.toLowerCase().includes("responsable de pago")
      ) {
        // Si el backend informa que no existe el responsable por CUIT, ofrecemos darlo de alta
        setAltaModal({
          message: "No se encontró un responsable con ese CUIT. ¿Desea darlo de alta?",
          prefill: { cuit: payload.cuitTercero },
        });
      } else {
        setErrorModal(err || "No se pudo preparar la factura.");
      }
      return;
    }

    const requiereConfirmacionTercero =
      payload.cuitTercero && !confirmResponsable && (forzarConfirmacionTercero || true);

    if (requiereConfirmacionTercero) {
      // guardamos la previsualización para no perderla tras aceptar
      setPreviewPendiente(data || null);
      setConfirmResponsable({
        nombre: data?.responsable?.nombreOrazonSocial || payload.cuitTercero,
        cuit: data?.responsable?.cuit || payload.cuitTercero,
        payloadOverride: { cuitTercero: payload.cuitTercero },
      });
      return;
    }

    setPreview(data);
    setItemsSeleccionados(
      (data.items || [])
        .filter((i) => i.incluido)
        .map((i) => i.id)
    );
    setStep("preview");
  };

  const handlePrevisualizar = async (omitirConfirmacionTercero = false) => {
    if (!estadiaId) return;
    if (!seleccionResponsable) {
      setError("Seleccione un responsable o ingrese un CUIT de tercero.");
      return;
    }

    let cuitNormalizado = cuitTercero;
    let forzarConfirmDespuesDePreview = false;

    if (seleccionResponsable.tipo === "tercero") {
      const digits = normalizeCuitDigits(cuitTercero || seleccionResponsable.value);
      cuitNormalizado = formatCuit(digits) || digits;

      if (digits.length !== 11) {
        setAltaModal({
          message: "Ingrese un CUIT o dé de alta al responsable de pago.",
          prefill: { cuit: "" },
        });
        return;
      }

      setCuitTercero(digits);
      setSeleccionResponsable({ tipo: "tercero", value: cuitNormalizado });

      if (!omitirConfirmacionTercero) {
        // Intentamos la búsqueda rápida; si no responde, dejamos que el backend decida.
        try {
          const encontrado = await buscarResponsablePorCuit(digits, cuitNormalizado);
          if (encontrado) {
            const nombre =
              encontrado.razonSocial ||
              encontrado.nombreCompleto ||
              [encontrado.apellido, encontrado.nombre].filter(Boolean).join(" ") ||
              encontrado.cuit;
            setConfirmResponsable({
              nombre,
              cuit: encontrado.cuit || cuitNormalizado,
              payloadOverride: { cuitTercero: cuitNormalizado },
            });
            return; // detener aquí hasta aceptar
          }
        } catch (_) {
          // ignoramos errores de red/sandbox
        }
        // Seguimos a la previsualización y forzamos confirmación si el backend trae al responsable.
        forzarConfirmDespuesDePreview = true;
      }
    }

    const payload = {
      estadiaId,
      huespedResponsable:
        seleccionResponsable.tipo === "huesped" ? seleccionResponsable.value : null,
      cuitTercero:
        seleccionResponsable.tipo === "tercero"
         ? cuitNormalizado || seleccionResponsable.value
         : null,
    };

    setPrevisualizando(true);
    try {
      await doPrevisualizacion(payload, forzarConfirmDespuesDePreview);
    } finally {
      setPrevisualizando(false);
    }
  };


  const handleConfirmarResponsableExistente = async (aceptar) => {
    if (!confirmResponsable) return;
    if (!aceptar) {
      setConfirmResponsable(null);
      return;
    }

    const payload = {
      estadiaId,
      huespedResponsable:
        seleccionResponsable?.tipo === "huesped"
          ? seleccionResponsable.value
          : null,
      cuitTercero: confirmResponsable.payloadOverride?.cuitTercero || null,
    };

    setConfirmResponsable(null);
    setPrevisualizando(true);
    try {
      if (previewPendiente) {
        setPreview(previewPendiente);
        setItemsSeleccionados(
          (previewPendiente.items || []).filter((i) => i.incluido).map((i) => i.id)
        );
        setStep("preview");
        setPreviewPendiente(null);
      } else {
        await doPrevisualizacion(payload);
      }
    } finally {
      setPrevisualizando(false);
    }
  };

  const toggleItem = (id) => {
    setItemsSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const esItemObligatorio = (item) =>
    item?.tipo === "ESTADIA" || !item?.descripcion?.includes("*");

  const validarItemsSeleccionados = () => {
    const items = dedupeItems(preview?.items || []);
    const requeridos = items.filter(esItemObligatorio);
    const faltaRequerido = requeridos.some((i) => !itemsSeleccionados.includes(i.id));
    if (faltaRequerido) {
      setErrorModal("Debe seleccionar los items obligatorios (marcados con *).");
      return false;
    }
    return true;
  };

  const handleImprimir = async () => {
    if (!preview) return;
    if (!validarItemsSeleccionados()) return;

    setGenerando(true);
    const payload = {
      estadiaId: preview.estadiaId,
      responsableId: preview.responsable.id,
      idsItemsSeleccionados: itemsSeleccionados,
    };
    const { ok, data, error: err } = await generarFactura(payload);
    setGenerando(false);
    setPrevisualizando(false);
    if (!ok) {
      setErrorModal(err || "No se pudo generar la factura.");
      return;
    }
    setFacturaFinal(data);
    setSuccessModal(
      `Factura Numero ${data.facturaId} generada correctamente.`
    );
    window.print();
  };



  const resetTodo = () => {
    setNumeroHabitacion("");
    setFechaEgreso("");
    setBuscando(false);
    setOcupantes([]);
    setEstadiaId(null);
    setSeleccionResponsable(null);
    setCuitTercero("");
    setError(null);
    setFieldErrors({});
    setStep("buscar");
    setPreview(null);
    setItemsSeleccionados([]);
    setFacturaFinal(null);
    setMostrandoResultados(false);
    setPreviewPendiente(null);
    setPendingSeleccion(null);
    setConfirmResponsable(null);
    setErrorModal(null);
    setAltaModal(null);
    setSuccessModal(null);
    setGenerando(false);
  };

  const handleCancelarBusqueda = () => {
    resetTodo();
    navigate("/");
  };

  const renderBusqueda = () => (
    <div className="factura-page">
      <section className="factura-panel left">
        <h2>Generar check out</h2>

        <label className="field-label">
          <span className="label-row">
            Nro. de habitación <span className="required">*</span>
          </span>
          <input
            type="number"
            value={numeroHabitacion}
            onChange={(e) => setNumeroHabitacion(e.target.value)}
            ref={nroHabitacionRef}
            placeholder="Nro. de habitación"
            className={fieldErrors.numeroHabitacion ? "input-error" : ""}
          />
          {fieldErrors.numeroHabitacion && (
            <div className="error-inline">{fieldErrors.numeroHabitacion}</div>
          )}
        </label>

        <label className="field-label">
          <span className="label-row">
            Fecha de salida <span className="required">*</span>
          </span>
          <input
            type="date"
            value={fechaEgreso}
            onChange={(e) => setFechaEgreso(e.target.value)}
            ref={fechaEgresoRef}
            placeholder="Fecha de salida"
            className={fieldErrors.fechaEgreso ? "input-error" : ""}
          />
          {fieldErrors.fechaEgreso && (
            <div className="error-inline">{fieldErrors.fechaEgreso}</div>
          )}
        </label>

        {error && <div className="error-inline">{error}</div>}

        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={handleCancelarBusqueda}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleBuscar}
            disabled={buscando}
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </section>

      {mostrandoResultados && (
        <section className="factura-panel right">
          <h2>Resultados de búsqueda</h2>

          {ocupantes.length === 0 ? (
            <p className="muted">No hay ocupantes cargados.</p>
          ) : (
            <ul className="lista-ocupantes">
              {ocupantes.map((o, idx) => (
                <li key={idx} className="ocupante-item">
                  <label className="radio-line">
                    <input
                      type="radio"
                      name="responsable"
                      checked={
                        seleccionResponsable?.tipo === "huesped" &&
                        seleccionResponsable.value?.nroDoc === o.huespedId.nroDoc &&
                        seleccionResponsable.value?.tipoDoc === o.huespedId.tipoDoc
                      }
                      onChange={() => handleSeleccionHuesped(o.huespedId)}
                    />
                    <span>
                      {o.nombreCompleto} - {o.nroDocumento} ({o.tipoDocumento})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {estadiaId && (
            <div className="tercero-row">
              <label className="radio-line">
                <input
                  type="checkbox"
                  checked={seleccionResponsable?.tipo === "tercero"}
                  onChange={(e) => {
                    handleSeleccionTercero(e.target.checked);
                  }}
                />
                <span>Facturar a nombre de un tercero</span>
              </label>
              {seleccionResponsable?.tipo === "tercero" && (
                <input
                  type="text"
                  placeholder="CUIT"
                  value={formatCuit(cuitTercero)}
                  inputMode="numeric"
                  pattern="\d{2}-?\d{8}-?\d{1}"
                  title="Formato esperado: XX-XXXXXXXX-X"
                  onChange={(e) => {
                    const digits = normalizeCuitDigits(e.target.value);
                    setCuitTercero(digits);
                    setSeleccionResponsable({ tipo: "tercero", value: formatCuit(digits) });
                  }}
                />
              )}
            </div>
          )}

          <div className="actions-row right-align">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handlePrevisualizar}
              disabled={!estadiaId || previsualizando}
            >
              {previsualizando ? "Buscando..." : "Siguiente"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
  const renderPreview = () => (
    <div className="factura-page">
      {(() => {
        const items = dedupeItems(preview?.items || []);
        const seleccionados = items.filter((i) => itemsSeleccionados.includes(i.id));
        const totalEstadia = seleccionados
          .filter((i) => i.tipo === "ESTADIA")
          .reduce((acc, i) => acc + (i.monto || 0), 0);
        const totalConsumos = seleccionados
          .filter((i) => i.tipo === "SERVICIO")
          .reduce((acc, i) => acc + (i.monto || 0), 0);
        const subtotal = totalEstadia + totalConsumos;
        const esFacturaA = preview?.responsable?.tipoFactura === "A";
        const iva = esFacturaA ? subtotal * 0.21 : 0;
        const total = subtotal + iva;

        return (
          <>
            <section className="factura-panel left">
              <div className="factura-header">
                <div className="responsable-box">
                  <div className="avatar-placeholder" />
                  <div>
                    <p className="label">Persona responsable</p>
                    {(() => {
                      const nombre = preview?.responsable?.nombreOrazonSocial || "";
                      const cuit = (preview?.responsable?.cuit || "").trim();
                      const texto = cuit ? `${nombre} - ${cuit}` : nombre;
                      return (
                        <p className="responsable-text">
                          {texto}
                        </p>
                      );
                    })()}
                    <p className="muted small">IVA: {formatIVA(preview?.responsable?.posicionIVA || "")}</p>
                  </div>
                </div>
                <img
                  src="/data/logo-hotel-premier.png"
                  alt="Hotel Premier"
                  className="factura-logo"
                />
              </div>

              <hr />

              <h3>Items pendientes a facturar</h3>
              <div className="items-list">
                {(preview?.items || []).map((item) => (
                  <label key={item.id} className="check-line">
                    <input
                      type="checkbox"
                      checked={itemsSeleccionados.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span>
                      {item.descripcion} {esItemObligatorio(item) ? <span className="required">*</span> : null}
                    </span>
                  </label>
                ))}

              </div>
            </section>

            <section className="factura-panel right">
              <h2>Detalles de factura</h2>
              <div className="detalle-line">
                <span>VALOR DE ESTADIA</span>
                <strong>${totalEstadia.toFixed(2)}</strong>
              </div>
              <div className="detalle-line">
                <span>CONSUMOS DE HABITACIÓN</span>
                <strong>${totalConsumos.toFixed(2)}</strong>
              </div>
              <hr />
              <div className="detalle-line">
                <span>SUBTOTAL</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="detalle-line">
                <span>IVA</span>
                <strong>${iva.toFixed(2)}</strong>
              </div>
              <div className="detalle-line">
                <span>FACTURA TIPO</span>
                <strong>{preview?.responsable?.tipoFactura}</strong>
              </div>
              <hr />
              <div className="detalle-line total">
                <span>TOTAL</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div className="actions-row right-align print-hide">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={resetTodo}
                  disabled={generando}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" type="button" onClick={handleImprimir} disabled={generando}>
                  Imprimir
                </button>
              </div>
            </section>
          </>
        );
      })()}
    </div>
  );

  return (
    <div className="factura-wrapper">
      {step === "buscar" ? renderBusqueda() : renderPreview()}

      <Modal
        open={!!errorModal}
        title="ERROR"
        variant="danger"
        onClose={() => setErrorModal(null)}
        actions={
          <button className="btn btn-primary" onClick={() => setErrorModal(null)} type="button">
            Cerrar
          </button>
        }
      >
        <p>{errorModal}</p>
      </Modal>

      <Modal
        open={!!altaModal}
        title="RESPONSABLE DE PAGO"
        variant="danger"
        onClose={() => setAltaModal(null)}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setAltaModal(null)} type="button">
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const prefill = altaModal?.prefill || {};
                setAltaModal(null);
                navigate("/cu12", {
                  state: {
                    prefill,
                    fromCu07: {
                      numeroHabitacion,
                      fechaEgreso,
                      huesped: seleccionResponsable?.value,
                    },
                  },
                });
              }}
              type="button"
            >
              Dar de alta Responsable
            </button>
          </>
        }
      >
        <p>{altaModal?.message}</p>
        <p className="muted small">
          Podes dar de alta al huesped seleccionado como Responsable de Pago y volver a intentarlo.
        </p>
      </Modal>

      <Modal
        open={!!confirmResponsable}
        title="CONFIRMACION RESPONSABLE DE PAGO"
        variant="success"
        onClose={() => setConfirmResponsable(null)}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => handleConfirmarResponsableExistente(false)} type="button">Cancelar</button>
            <button className="btn btn-primary" onClick={() => handleConfirmarResponsableExistente(true)} type="button">Aceptar</button>
          </>
        }
      >
        <p>Responsable hallado: <strong>{confirmResponsable?.nombre}</strong></p>
        <p>CUIT: {confirmResponsable?.cuit}</p>
        <p className="muted small">Si aceptas se usara este responsable para la factura.</p>
      </Modal>


      <Modal
        open={!!successModal}
        title="CONFIRMACION"
        variant="success"
        onClose={() => setSuccessModal(null)}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setSuccessModal(null);
              resetTodo();
            }}
            type="button"
          >
            Aceptar
          </button>
        }
      >
        <p>{successModal}</p>
        {facturaFinal && (
          <p className="muted small">ID: {facturaFinal.facturaId}</p>
        )}
      </Modal>
    </div>
  );
};

export default FacturarPage;
