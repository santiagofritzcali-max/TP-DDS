import React, { useEffect, useState } from "react";
import "../styles/responsableStyle.css";
import "../styles/ui.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  actualizarResponsable,
  eliminarResponsable,
  obtenerResponsable,
} from "../services/responsablePagoService";
import Modal from "../components/Modal";

const posicionIvaOptions = [
  "ResponsableInscripto",
  "Monotributista",
  "Exento",
  "ConsumidorFinal",
  "NoCorresponde",
];

const ModificarResponsablePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [errores, setErrores] = useState({});
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const targetId = id || location.state?.responsableId;
    if (!targetId) return;
    (async () => {
      setLoading(true);
      const { ok, data, error } = await obtenerResponsable(targetId);
      setLoading(false);
      if (!ok) {
        setErrorModal(error || "No se pudo cargar el responsable.");
        return;
      }
      setForm({
        id: data.id,
        razonSocial: data.razonSocial,
        cuit: data.cuit,
        posicionIVA: data.posicionIVA,
        telefono: data.telefono || "",
        direccion: data.direccion || {
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
    })();
  }, [id, location.state]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleDirChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      direccion: { ...(prev?.direccion || {}), [campo]: valor },
    }));
  };

  const validar = () => {
    const errs = {};
    if (!form.razonSocial) errs.razonSocial = "Requerido";
    if (!form.cuit) errs.cuit = "Requerido";
    if (!form.posicionIVA) errs.posicionIVA = "Requerido";
    if (!form.telefono) errs.telefono = "Requerido";
    ["calle", "numero", "codigoPostal", "localidad", "ciudad", "provincia", "pais"].forEach((f) => {
      if (!form.direccion?.[f]) errs[f] = "Requerido";
    });
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    if (!validar()) return;
    const { ok, error } = await actualizarResponsable(form.id, form);
    if (!ok) {
      setErrorModal(error || "No se pudo modificar el responsable.");
      return;
    }
    setSuccessModal("La operación ha culminado con éxito.");
  };

  const handleDelete = async () => {
    if (!form) return;
    const { ok, error } = await eliminarResponsable(form.id);
    if (!ok) {
      setErrorModal(error || "No se pudo eliminar el responsable.");
      return;
    }
    setShowDeleteConfirm(false);
    setSuccessModal("Los datos de razón social, CUIT han sido eliminados del sistema.");
  };

  if (loading || !form) {
    return (
      <div className="responsable-wrapper">
        <p className="muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="responsable-wrapper">
      <section className="responsable-panel wide">
        <h2>Modificar Responsable de Pago</h2>
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
              {posicionIvaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
              value={form.direccion?.calle || ""}
              onChange={(e) => handleDirChange("calle", e.target.value)}
            />
            {errores.calle && <span className="error-inline">{errores.calle}</span>}
          </label>

          <label className="field-label">
            Número <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.numero || ""}
              onChange={(e) => handleDirChange("numero", e.target.value)}
            />
            {errores.numero && <span className="error-inline">{errores.numero}</span>}
          </label>

          <label className="field-label">
            Departamento
            <input
              type="text"
              value={form.direccion?.departamento || ""}
              onChange={(e) => handleDirChange("departamento", e.target.value)}
            />
          </label>

          <label className="field-label">
            Piso
            <input
              type="text"
              value={form.direccion?.piso || ""}
              onChange={(e) => handleDirChange("piso", e.target.value)}
            />
          </label>

          <label className="field-label">
            Código postal <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.codigoPostal || ""}
              onChange={(e) => handleDirChange("codigoPostal", e.target.value)}
            />
            {errores.codigoPostal && <span className="error-inline">{errores.codigoPostal}</span>}
          </label>

          <label className="field-label">
            Localidad <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.localidad || ""}
              onChange={(e) => handleDirChange("localidad", e.target.value)}
            />
            {errores.localidad && <span className="error-inline">{errores.localidad}</span>}
          </label>

          <label className="field-label">
            Ciudad <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.ciudad || ""}
              onChange={(e) => handleDirChange("ciudad", e.target.value)}
            />
            {errores.ciudad && <span className="error-inline">{errores.ciudad}</span>}
          </label>

          <label className="field-label">
            Provincia <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.provincia || ""}
              onChange={(e) => handleDirChange("provincia", e.target.value)}
            />
            {errores.provincia && <span className="error-inline">{errores.provincia}</span>}
          </label>

          <label className="field-label">
            País <span className="required">*</span>
            <input
              type="text"
              value={form.direccion?.pais || ""}
              onChange={(e) => handleDirChange("pais", e.target.value)}
            />
            {errores.pais && <span className="error-inline">{errores.pais}</span>}
          </label>

          <div className="actions-row full-row">
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/cu03")}>
              Cancelar
            </button>
            <button className="btn btn-danger" type="button" onClick={() => setShowDeleteConfirm(true)}>
              Borrar
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
          navigate("/cu03");
        }}
      >
        <p>{successModal}</p>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        title="ELIMINAR"
        variant="warning"
        onClose={() => setShowDeleteConfirm(false)}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} type="button">
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={handleDelete} type="button">
              Eliminar
            </button>
          </>
        }
      >
        <p>Los datos de razón social, CUIT serán eliminados del sistema.</p>
      </Modal>
    </div>
  );
};

export default ModificarResponsablePage;

