// src/components/PopupReservaExitosa.js
import React from "react";
import "../styles/reservarHabitacionStyle.css";

const PopupReservaExitosa = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3 className="popup-title">Reserva exitosa</h3>

        <p className="popup-message">
          La reserva se registró correctamente.
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

export default PopupReservaExitosa;
