import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/facturacionStyle.css";
import "../styles/ui.css";
import Modal from "../components/Modal";
import { buscarFacturasPendientes, generarNotaCredito } from "../services/notaCreditoService";
import { DOC_TYPES } from "../constants/docTypes";

const IngresarNotaCreditoPage = () => {
  const navigate = useNavigate();
  const [cuit, setCuit] = useState("");
  const [tipoDoc, setTipoDoc] = useState("");
  const [nroDoc, setNroDoc] = useState("");

  const [errores, setErrores] = useState({});
  const [facturas, setFacturas] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);

  const resumen = useMemo(() => {
    const elegidas = facturas.filter((f) => seleccion.includes(f.facturaId));
    const neto = elegidas.reduce((acc, f) => acc + (f.neto || 0), 0);
    const iva = elegidas.reduce((acc, f) => acc + (f.iva || 0), 0);
    const total = elegidas.reduce((acc, f) => acc + (f.total || 0), 0);
    return { neto, iva, total, elegidas };
  }, [facturas, seleccion]);

  const validarBusqueda = () => {
    const errs = {};
    const cuitTrim = cuit.trim();
    const nroDocTrim = nroDoc.trim();

    if (!cuitTrim && (!tipoDoc || !nroDocTrim)) {
      errs.general = "Complete CUIT o Tipo y Nro de documento.";
      if (!tipoDoc) errs.tipoDoc = "Seleccione el tipo de documento.";
      if (!nroDocTrim) errs.nroDoc = "Ingrese el nro de documento.";
    }
    if (cuitTrim && tipoDoc && nroDocTrim) {
      errs.general = "No ingrese CUIT y Tipo/Nro a la vez. Use solo una opcion.";
    }
    if (cuitTrim && cuitTrim.replace(/[^0-9]/g, "").length !== 11) {
      errs.cuit = "El CUIT debe tener 11 digitos.";
    }
    return errs;
  };

  const handleBuscar = async () => {
    const errs = validarBusqueda();
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      setErrorModal(errs.general || errs.cuit || errs.tipoDoc || errs.nroDoc || "Complete CUIT o Tipo y Nro de documento.");
      return;
    }

    const params = {
      cuit: cuit.trim() || null,
      tipoDoc: cuit ? null : tipoDoc,
      nroDoc: cuit ? null : nroDoc.trim(),
    };
    setBuscando(true);
    const { ok, data, error } = await buscarFacturasPendientes(params);
    setBuscando(false);
    if (!ok) {
      setErrorModal(error || "No se pudieron obtener facturas pendientes.");
      return;
    }
    setFacturas(data || []);
    setSeleccion([]);
  };

  const toggleFactura = (id) => {
    setSeleccion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerar = async () => {
    if (seleccion.length === 0) {
      setErrorModal("Seleccione al menos una factura a cancelar.");
      return;
    }
    const payload = {
      cuit: cuit.trim() || null,
      tipoDoc: cuit ? null : tipoDoc,
      nroDoc: cuit ? null : nroDoc.trim(),
      facturaIds: seleccion,
    };
    setGenerando(true);
    const { ok, data, error } = await generarNotaCredito(payload);
    setGenerando(false);
    if (!ok) {
      setErrorModal(error || "No se pudo generar la nota de credito.");
      return;
    }
    setSuccessModal(data);
    setFacturas([]);
    setSeleccion([]);
  };

  return (
    <div className="factura-wrapper">
      <div className="factura-page">
        <section className="factura-panel left">
          <h2>Ingresar nota de credito</h2>

          <label className="field-label">
            CUIT
            <input
              type="text"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="XX-XXXXXXXX-X"
              style={errores.cuit ? { borderColor: "#c62828" } : undefined}
            />
            {errores.cuit && <div className="error-inline">{errores.cuit}</div>}
          </label>

          <p className="muted small">O bien indique Tipo y Nro. de documento</p>

          <label className="field-label">
            Tipo Documento
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value)}
              style={errores.tipoDoc ? { borderColor: "#c62828" } : undefined}
            >
              <option value="">Selecciona Tipo Documento</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Nro. Documento
            <input
              type="text"
              value={nroDoc}
              onChange={(e) => setNroDoc(e.target.value)}
              style={errores.nroDoc ? { borderColor: "#c62828" } : undefined}
            />
          </label>
          <div className="actions-row">
            <button className="btn btn-secondary" type="button" onClick={() => setCancelModal(true)}>
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

          <h3>Facturas encontradas</h3>
          {facturas.length === 0 ? (
            <p className="muted small">No hay facturas pendientes para esos datos.</p>
          ) : (
            <ul className="lista-ocupantes">
              {facturas.map((f) => (
                <li key={f.facturaId} className="ocupante-item">
                  <label className="check-line">
                    <input
                      type="checkbox"
                      checked={seleccion.includes(f.facturaId)}
                      onChange={() => toggleFactura(f.facturaId)}
                    />
                    <span>
                      Nro: {f.numeroFactura} | Fecha: {f.fechaEmision} | Tipo: {f.tipoFactura} | Neto: ${Number(f.neto || 0).toFixed(2)} | IVA: ${Number(f.iva || 0).toFixed(2)} | Total: ${Number(f.total || 0).toFixed(2)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="factura-panel right">
          <h2>Resumen nota de credito</h2>

          <div className="detalle-line">
            <span>Neto</span>
            <strong>${resumen.neto.toFixed(2)}</strong>
          </div>
          <div className="detalle-line">
            <span>IVA</span>
            <strong>${resumen.iva.toFixed(2)}</strong>
          </div>
          <div className="detalle-line">
            <span>Total</span>
            <strong>${resumen.total.toFixed(2)}</strong>
          </div>

          <div className="items-list" style={{ marginTop: "12px" }}>
            <p className="label">Detalle importes seleccionados</p>
            {resumen.elegidas.length === 0 ? (
              <p className="muted small">No hay facturas seleccionadas.</p>
            ) : (
              <ul className="lista-ocupantes">
                {resumen.elegidas.map((f) => (
                  <li key={f.facturaId} className="ocupante-item">
                    <div>
                      Factura {f.numeroFactura} - Total: ${Number(f.total || 0).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="actions-row right-align">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleGenerar}
              disabled={seleccion.length === 0 || generando}
            >
              {generando ? "Generando..." : "Generar nota de credito"}
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={!!errorModal}
        title="Error"
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
        open={!!successModal}
        title="Nota de credito generada"
        variant="success"
        onClose={() => {
          setSuccessModal(null);
          navigate("/");
        }}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setSuccessModal(null);
              navigate("/");
            }}
            type="button"
          >
            Aceptar
          </button>
        }
      >
        {successModal && (
          <div className="detalle-lineas">
            <p><strong>Nro de nota:</strong> {successModal.numeroNotaCredito}</p>
            <p><strong>Responsable:</strong> {successModal.responsable}</p>
            <p><strong>Neto:</strong> ${Number(successModal.neto || 0).toFixed(2)}</p>
            <p><strong>IVA:</strong> ${Number(successModal.iva || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> ${Number(successModal.total || 0).toFixed(2)}</p>
          </div>
        )}
      </Modal>

      <Modal
        open={cancelModal}
        title="CANCELAR"
        variant="success"
        onClose={() => setCancelModal(false)}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setCancelModal(false)} type="button">
              No
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCancelModal(false);
                navigate("/");
              }}
              type="button"
            >
              Sí
            </button>
          </>
        }
      >
        <p>¿Desea cancelar la carga de la nota de crédito?</p>
      </Modal>
    </div>
  );
};

export default IngresarNotaCreditoPage;
