// src/pages/DatosReservaPage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/reservarHabitacionStyle.css";
import { confirmarReserva } from "../services/reservaService";

const DatosReservaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Si se llegó sin state, evitamos que explote
  const state = location.state || {};
  const {
    fechaDesde = "",
    fechaHasta = "",
    habitaciones = [],
  } = state;

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    prefijo: "+54 9",
    telefono: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // errores por campo
  const [fieldErrors, setFieldErrors] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
  });

  // pop-up de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ----------------- handlers básicos -----------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelar = () => {
    // Termina el CU y vuelve al menú principal
    navigate("/");
  };

  // ----------------- validación por campo -----------------

  const validarFormulario = () => {
    const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const soloNumeros = /^[0-9]+$/;

    const errors = { nombre: "", apellido: "", telefono: "" };
    let esValido = true;

    // NOMBRE
    const nombreTrim = form.nombre.trim();
    if (!nombreTrim) {
      errors.nombre = "El campo Nombre es requerido.";
      esValido = false;
    } else if (!soloLetras.test(nombreTrim)) {
      errors.nombre =
        "El campo Nombre no puede contener números o caracteres especiales";
      esValido = false;
    }

    // APELLIDO
    const apellidoTrim = form.apellido.trim();
    if (!apellidoTrim) {
      errors.apellido = "El campo Apellido es requerido.";
      esValido = false;
    } else if (!soloLetras.test(apellidoTrim)) {
      errors.apellido =
        "El campo Apellido no puede contener números o caracteres especiales";
      esValido = false;
    }

    // TELÉFONO (solo dígitos)
    const telTrim = form.telefono.trim();
    if (!telTrim) {
      errors.telefono = "El campo Nro. Teléfono es requerido";
      esValido = false;
    } else if (!soloNumeros.test(telTrim)) {
      errors.telefono =
        "El campo Nro. Teléfono no puede contener letras o caracteres especiales";
      esValido = false;
    }

    setFieldErrors(errors);
    return esValido;
  };

  // ----------------- confirmar reserva -----------------

  const handleConfirmar = async () => {
    setError("");

    // validación por campo
    const esFormValido = validarFormulario();
    if (!esFormValido) return;

    // validar que haya habitaciones
    if (!habitaciones || habitaciones.length === 0) {
      setError("No hay habitaciones seleccionadas para confirmar.");
      return;
    }

    try {
      setEnviando(true);

      const telefonoCompleto = `${form.prefijo} ${form.telefono}`;

      const payload = {
        numerosHabitacion: habitaciones.map((h) => h.nro), // "piso-hab"
        fechaInicio: fechaDesde, // yyyy-MM-dd
        fechaFin: fechaHasta,    // yyyy-MM-dd
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: telefonoCompleto.trim(),
      };

      await confirmarReserva(payload);

      // limpiamos errores de campos
      setFieldErrors({ nombre: "", apellido: "", telefono: "" });

      // mostramos pop-up de éxito
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al confirmar la reserva.");
    } finally {
      setEnviando(false);
    }
  };

  const handleCerrarModalExito = () => {
    setShowSuccessModal(false);
    // El CU termina: volvemos al menú principal
    navigate("/");
  };

  return (
    <div className="reserva-page">
      {/* Usamos el MISMO layout que en la primera pantalla */}
      <main className="main-layout">
        {/* IZQUIERDA – listado de habitaciones (scroll) */}
        <section className="left-panel">
          <h2 className="section-title">Habitaciones seleccionadas</h2>

          <div className="selected-rooms-list">
            {!habitaciones || habitaciones.length === 0 ? (
              <p className="text-empty-right">
                No hay habitaciones seleccionadas.
              </p>
            ) : (
              habitaciones.map((item, idx) => (
                <div
                  className="selected-room-item"
                  key={`${item.fechaIngreso}-${item.nro}-${idx}`}
                >
                  <div className="selected-room-type">
                    Tipo de habitación: {item.tipo || ""}
                  </div>
                  <div className="selected-room-line">
                    Ingreso: {item.fechaIngreso}, 13:00 hs
                  </div>
                  <div className="selected-room-line">
                    Egreso: {item.fechaEgreso}, 8 hs
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* DERECHA – formulario de datos del huésped */}
        <section className="right-panel">
          <h2 className="section-subtitle">Reserva a nombre de</h2>

          <form
            className="datos-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmar();
            }}
          >
            {/* Nombre */}
            <div className="input-group">
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={`input ${fieldErrors.nombre ? "input-error" : ""}`}
                value={form.nombre}
                onChange={handleChange}
                required
              />
              <label htmlFor="nombre" className="user-label">
                Nombre <span className="required">*</span>
              </label>
              {fieldErrors.nombre && (
                <p className="field-error-message">{fieldErrors.nombre}</p>
              )}
            </div>

            {/* Apellido */}
            <div className="input-group">
              <input
                id="apellido"
                name="apellido"
                type="text"
                className={`input ${fieldErrors.apellido ? "input-error" : ""}`}
                value={form.apellido}
                onChange={handleChange}
                required
              />
              <label htmlFor="apellido" className="user-label">
                Apellido <span className="required">*</span>
              </label>
              {fieldErrors.apellido && (
                <p className="field-error-message">{fieldErrors.apellido}</p>
              )}
            </div>

            {/* Teléfono: prefijo + número */}
            <div className="phone-group">
              <label className="phone-label" htmlFor="telefono">
                Número Teléfono <span className="required">*</span>
              </label>

              <div className="phone-row">
                <select
                  id="prefijo"
                  name="prefijo"
                  className="phone-prefix"
                  value={form.prefijo}
                  onChange={handleChange}
                >
                  <option value="+54 9">+54 9</option>
                  <option value="+54">+54</option>
                  {/* más prefijos si se desea */}
                </select>

                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  className={`phone-input ${
                    fieldErrors.telefono ? "input-error" : ""
                  }`}
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              {fieldErrors.telefono && (
                <p className="field-error-message">{fieldErrors.telefono}</p>
              )}
            </div>

            <div className="actions-row">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelar}
                disabled={enviando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button primary-button-strong"
                disabled={enviando}
              >
                Confirmar
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}
          </form>
        </section>
      </main>

      {/* -------- POP-UP DE RESERVA EXITOSA -------- */}
      {showSuccessModal && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3 className="popup-title">Reserva exitosa</h3>

            <p className="popup-message">
              La reserva se registró correctamente.
            </p>

            <div className="popup-actions">
              <button
                type="button"
                className="primary-button primary-button-strong"
                onClick={handleCerrarModalExito}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatosReservaPage;
