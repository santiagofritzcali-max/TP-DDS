import React, { useEffect, useMemo, useState } from "react";
import "../styles/responsableStyle.css";
import "../styles/ui.css";
import { useLocation, useNavigate } from "react-router-dom";
import { crearResponsable } from "../services/responsablePagoService";
import Modal from "../components/Modal";

const ivaOptionsRaw = ["ResponsableInscripto", "Monotributista", "Exento", "ConsumidorFinal", "NoCorresponde"];

const formatIvaLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\bIva\b/gi, "IVA")
    .replace(/\bNo Corresponde\b/i, "No corresponde");

const AltaResponsablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const formatCuit = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
  };

  const ivaOptions = useMemo(
    () => ivaOptionsRaw.map((v) => ({ value: v, label: formatIvaLabel(v) })),
    []
  );

  const prefill = location.state?.prefill || {};
  const fromCu07 = location.state?.fromCu07;
  const [form, setForm] = useState({
    razonSocial: "",
    cuit: "",
    posicionIVA: "",
    telefono: "",
    huespedTipoDoc: "",
    huespedNroDoc: "",
    direccion: {
      calle: "",
      numero: "",
      departamento: "",
      piso: "",
      codigoPostal: "",
      localidad: "",
      ciudad: "",
      provincia: "",
      pais: "",
    },
  });

  const [errores, setErrores] = useState({});
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  useEffect(() => {
    if (!prefill) return;
    setForm((prev) => ({
      ...prev,
      razonSocial: prefill.razonSocial || prefill.nombreCompleto || prev.razonSocial,
      cuit: formatCuit(prefill.cuit || prev.cuit),
      posicionIVA: prefill.posicionIVA || prev.posicionIVA,
      telefono: prefill.telefono || prev.telefono,
      huespedTipoDoc: prefill.tipoDoc || prev.huespedTipoDoc,
      huespedNroDoc: prefill.nroDoc || prev.huespedNroDoc,
      direccion: {
        ...prev.direccion,
        ...(prefill.direccion || {}),
      },
    }));
  }, [prefill]);

  const handleChange = (campo, valor) => {
    const next = campo === "cuit" ? formatCuit(valor) : valor;
    setForm((prev) => ({ ...prev, [campo]: next }));
  };

  const handleDirChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      direccion: { ...prev.direccion, [campo]: valor },
    }));
  };

  const validar = () => {
    const errs = {};
    if (!form.razonSocial) errs.razonSocial = "Requerido";
    if (!form.cuit) errs.cuit = "Requerido";
    if (!form.posicionIVA) errs.posicionIVA = "Requerido";
    if (!form.telefono) errs.telefono = "Requerido";
    ["calle", "numero", "codigoPostal", "localidad", "ciudad", "provincia", "pais"].forEach((f) => {
      if (!form.direccion[f]) errs[f] = "Requerido";
    });
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    const { ok, error, data } = await crearResponsable(form);
    if (!ok) {
      const errores =
        Array.isArray(data?.errores) && data.errores.length > 0
          ? data.errores
          : data?.mensaje
            ? [data.mensaje]
            : [];
      setErrorModal(
        errores.length > 0
          ? errores.join(" | ")
          : error || "No se pudo crear el responsable."
      );
      return;
    }
    setSuccessModal("La firma ha sido satisfactoriamente cargada al sistema.");
  };

  return (
    <div className="responsable-wrapper">
      <section className="responsable-panel wide">
        <h2>Dar alta Responsable de Pago</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            Razón social <span className="required">*</span>
            <input
              type="text"
              value={form.razonSocial}
              onChange={(e) => handleChange("razonSocial", e.target.value)}
            />
            {errores.razonSocial && <span className="error-inline">{errores.razonSocial}</span>}
          </label>

          <label className="field-label">
            CUIT <span className="required">*</span>
            <input
              type="text"
              value={form.cuit}
              onChange={(e) => handleChange("cuit", e.target.value)}
            />
            {errores.cuit && <span className="error-inline">{errores.cuit}</span>}
          </label>

          <label className="field-label">
            Posición IVA <span className="required">*</span>
            <select
              value={form.posicionIVA}
              onChange={(e) => handleChange("posicionIVA", e.target.value)}
            >
              <option value="">Seleccione...</option>
              {ivaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errores.posicionIVA && <span className="error-inline">{errores.posicionIVA}</span>}
          </label>

          <label className="field-label">
            Teléfono <span className="required">*</span>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />
            {errores.telefono && <span className="error-inline">{errores.telefono}</span>}
          </label>

          <div className="full-row">
            <h3>Dirección</h3>
          </div>

          <label className="field-label">
            Calle <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.calle}
              onChange={(e) => handleDirChange("calle", e.target.value)}
            />
            {errores.calle && <span className="error-inline">{errores.calle}</span>}
          </label>

          <label className="field-label">
            Número <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.numero}
              onChange={(e) => handleDirChange("numero", e.target.value)}
            />
            {errores.numero && <span className="error-inline">{errores.numero}</span>}
          </label>

          <label className="field-label">
            Departamento
            <input
              type="text"
              value={form.direccion.departamento}
              onChange={(e) => handleDirChange("departamento", e.target.value)}
            />
          </label>

          <label className="field-label">
            Piso
            <input
              type="text"
              value={form.direccion.piso}
              onChange={(e) => handleDirChange("piso", e.target.value)}
            />
          </label>

          <label className="field-label">
            Código postal <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.codigoPostal}
              onChange={(e) => handleDirChange("codigoPostal", e.target.value)}
            />
            {errores.codigoPostal && <span className="error-inline">{errores.codigoPostal}</span>}
          </label>

          <label className="field-label">
            Localidad <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.localidad}
              onChange={(e) => handleDirChange("localidad", e.target.value)}
            />
            {errores.localidad && <span className="error-inline">{errores.localidad}</span>}
          </label>

          <label className="field-label">
            Ciudad <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.ciudad}
              onChange={(e) => handleDirChange("ciudad", e.target.value)}
            />
            {errores.ciudad && <span className="error-inline">{errores.ciudad}</span>}
          </label>

          <label className="field-label">
            Provincia <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.provincia}
              onChange={(e) => handleDirChange("provincia", e.target.value)}
            />
            {errores.provincia && <span className="error-inline">{errores.provincia}</span>}
          </label>

          <label className="field-label">
            País <span className="required">*</span>
            <input
              type="text"
              value={form.direccion.pais}
              onChange={(e) => handleDirChange("pais", e.target.value)}
            />
            {errores.pais && <span className="error-inline">{errores.pais}</span>}
          </label>

          <div className="actions-row full-row">
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit">
              Siguiente
            </button>
          </div>
        </form>
      </section>

      <Modal
        open={!!errorModal}
        title="Error"
        variant="danger"
        onClose={() => setErrorModal(null)}
      >
        <p>{errorModal}</p>
      </Modal>

      <Modal
        open={!!successModal}
        title="Confirmación"
        variant="success"
        onClose={() => {
          setSuccessModal(null);
          if (fromCu07) {
            navigate("/cu07", {
              state: {
                reintentar: {
                  numeroHabitacion: fromCu07.numeroHabitacion,
                  fechaEgreso: fromCu07.fechaEgreso,
                  huesped: fromCu07.huesped,
                },
              },
            });
          } else {
            navigate("/cu03");
          }
        }}
      >
        <p>{successModal}</p>
      </Modal>
    </div>
  );
};

export default AltaResponsablePage;
