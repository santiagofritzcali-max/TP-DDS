import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import {
  buscarOcupantes,
  prepararFactura,
  generarFactura,
} from "../services/facturacionService";
import { buscarHuespedes } from "../services/huespedService";
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
  const [facturaFinal, setFacturaFinal] = useState(null);
  const [pendingSeleccion, setPendingSeleccion] = useState(null); // {tipoDoc, nroDoc}

  const [errorModal, setErrorModal] = useState(null);
  const [altaModal, setAltaModal] = useState(null); // {message, prefill}
  const [successModal, setSuccessModal] = useState(null);

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
    setOcupantes([]);
    setSeleccionResponsable(null);
    setPreview(null);
    setFacturaFinal(null);

    if (!numeroHabitacion || !fechaEgreso) {
      setError("Complete Nro. de habitación y fecha de salida.");
      return;
    }

    const fechaBusqueda = fechaEgreso.includes("T") ? fechaEgreso.split("T")[0] : fechaEgreso;

    setBuscando(true);
    const { ok, data, error: err } = await buscarOcupantes(
      numeroHabitacion,
      fechaBusqueda
    );
    setBuscando(false);

    if (!ok) {
      setErrorModal(err || "No se pudo buscar ocupantes.");
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
  };

  const handleSeleccionTercero = () => {
    setSeleccionResponsable({ tipo: "tercero", value: cuitTercero });
  };

  const handlePrevisualizar = async () => {
    if (!estadiaId) return;
    if (!seleccionResponsable) {
      setError("Seleccione un responsable o ingrese un CUIT de tercero.");
      return;
    }

    const payload = {
      estadiaId,
      huespedResponsable:
        seleccionResponsable.tipo === "huesped"
          ? seleccionResponsable.value
          : null,
      cuitTercero:
        seleccionResponsable.tipo === "tercero"
          ? cuitTercero || seleccionResponsable.value
          : null,
    };

    const { ok, data, error: err } = await prepararFactura(payload);
    if (!ok) {
      if (
        seleccionResponsable?.tipo === "huesped" &&
        typeof err === "string" &&
        err.toLowerCase().includes("responsable de pago")
      ) {
        const huespedSel = ocupantes.find(
          (o) =>
            o.huespedId?.nroDoc === seleccionResponsable.value?.nroDoc &&
            o.huespedId?.tipoDoc === seleccionResponsable.value?.tipoDoc
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
            // si falla la bAºsqueda, seguimos con los datos que tenemos
          }
        }
        setAltaModal({
          message: err,
          prefill,
        });
      } else {
        setErrorModal(err || "No se pudo preparar la factura.");
      }
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

  const toggleItem = (id) => {
    setItemsSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerar = async () => {
    if (!preview) return;
    setGenerando(true);
    const payload = {
      estadiaId: preview.estadiaId,
      responsableId: preview.responsable.id,
      idsItemsSeleccionados: itemsSeleccionados,
    };
    const { ok, data, error: err } = await generarFactura(payload);
    setGenerando(false);
    if (!ok) {
      setErrorModal(err || "No se pudo generar la factura.");
      return;
    }
    setFacturaFinal(data);
    setSuccessModal(
      `Factura Nº ${data.numero || data.facturaId} generada correctamente.`
    );
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
    setStep("buscar");
    setPreview(null);
    setItemsSeleccionados([]);
    setFacturaFinal(null);
  };

  const renderBusqueda = () => (
    <div className="factura-page">
      <section className="factura-panel left">
        <h2>Generar check out</h2>

        <label className="field-label">
          Nro. de habitación <span className="required">*</span>
          <input
            type="number"
            value={numeroHabitacion}
            onChange={(e) => setNumeroHabitacion(e.target.value)}
            placeholder="Nro. de habitación"
          />
        </label>

        <label className="field-label">
          Fecha de salida <span className="required">*</span>
          <input
            type="date"
            value={fechaEgreso}
            onChange={(e) => setFechaEgreso(e.target.value)}
            placeholder="Fecha de salida"
          />
        </label>

        {error && <div className="error-inline">{error}</div>}

        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={resetTodo}>
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

        <div className="tercero-row">
          <label className="radio-line">
            <input
              type="radio"
              name="responsable"
              checked={seleccionResponsable?.tipo === "tercero"}
              onChange={handleSeleccionTercero}
            />
            <span>Facturar a nombre de un tercero</span>
          </label>
          <input
            type="text"
            placeholder="CUIT"
            value={cuitTercero}
            onChange={(e) => {
              setCuitTercero(e.target.value);
              setSeleccionResponsable({ tipo: "tercero", value: e.target.value });
            }}
          />
        </div>

        <div className="actions-row right-align">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handlePrevisualizar}
            disabled={!estadiaId}
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );

  const renderPreview = () => (
    <div className="factura-page">
      <section className="factura-panel left">
        <div className="responsable-box">
          <div className="avatar-placeholder" />
          <div>
            <p className="label">Persona responsable</p>
            <p className="responsable-text">
              {preview?.responsable?.nombreOrazonSocial} - {preview?.responsable?.cuit}
            </p>
            <p className="muted small">IVA: {preview?.responsable?.posicionIVA}</p>
          </div>
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
                {item.descripcion} {item.descripcion?.includes("*") ? "" : <span className="required">*</span>}
              </span>
            </label>
          ))}

        </div>

        <div className="actions-row">
          <button className="btn btn-secondary" type="button" onClick={resetTodo}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleGenerar}
            disabled={generando}
          >
            {generando ? "Generando..." : "Aceptar"}
          </button>
        </div>
      </section>

      <section className="factura-panel right">
        <h2>Detalles de factura</h2>
        <div className="detalle-line">
          <span>VALOR DE ESTADIA</span>
          <strong>${preview?.items?.find((i) => i.tipo === "ESTADIA")?.monto?.toFixed(2) || "0.00"}</strong>
        </div>
        <div className="detalle-line">
          <span>CONSUMOS DE HABITACIÓN</span>
          <strong>
            $
            {preview?.items
              ?.filter((i) => i.tipo === "SERVICIO")
              .reduce((acc, i) => acc + (i.monto || 0), 0)
              .toFixed(2) || "0.00"}
          </strong>
        </div>
        <hr />
        <div className="detalle-line">
          <span>SUBTOTAL</span>
          <strong>${preview?.subtotal?.toFixed(2) || "0.00"}</strong>
        </div>
        <div className="detalle-line">
          <span>IVA</span>
          <strong>${preview?.iva?.toFixed(2) || "0.00"}</strong>
        </div>
        <div className="detalle-line">
          <span>FACTURA TIPO</span>
          <strong>{preview?.responsable?.tipoFactura}</strong>
        </div>
        <hr />
        <div className="detalle-line total">
          <span>TOTAL</span>
          <strong>${preview?.total?.toFixed(2) || "0.00"}</strong>
        </div>

        <div className="actions-row right-align">
          <button className="btn btn-primary" type="button" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </section>
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
