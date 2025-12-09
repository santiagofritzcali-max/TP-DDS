// src/components/PopupHabitacionNoDisponible.js
import React from "react";
import "../styles/reservarHabitacionStyle.css";

const PopupHabitacionNoDisponible = ({ rango, onClose }) => {
  const textoRango =
    !rango || !rango.desde || !rango.hasta
      ? ""
      : rango.desde === rango.hasta
      ? rango.desde
      : `${rango.desde} - ${rango.hasta}`;

  const cantidad = rango?.cantidad || 0;
  const esUnaSolaFecha = cantidad === 1;

  const titulo = esUnaSolaFecha
    ? "Habitación no disponible"
    : "Habitaciones no disponibles";

  const sujeto = esUnaSolaFecha
    ? "La habitación"
    : "Las habitaciones";

  const verbo = esUnaSolaFecha ? "no está disponible" : "no están disponibles";

  const complemento = esUnaSolaFecha
    ? "para la fecha"
    : "para las fechas";

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3 className="popup-title">{titulo}</h3>

        <p className="popup-message">
          {sujeto} {verbo} {complemento}{" "}
          <strong>{textoRango}</strong>.
        </p>

        <div className="popup-actions">
          <button
            className="primary-button primary-button-strong"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupHabitacionNoDisponible;
