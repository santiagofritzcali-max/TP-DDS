// src/components/PopupCancelarReserva.js
import React from "react";
import "../styles/reservarHabitacionStyle.css";

const PopupCancelarReserva = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="cancel-popup-overlay">
      <div className="cancel-popup-modal" role="dialog" aria-modal="true">
        <h3 className="cancel-popup-title">CANCELAR</h3>

        <p className="cancel-popup-message">
          ¿Desea abortar el proceso de reserva?
        </p>

        <div className="cancel-popup-actions">
          <button
            type="button"
            className="cancel-btn cancel-btn--grey"
            onClick={onCancel}
          >
            No
          </button>

          <button
            type="button"
            className="cancel-btn cancel-btn--black"
            onClick={onConfirm}
          >
            Sí
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCancelarReserva;
