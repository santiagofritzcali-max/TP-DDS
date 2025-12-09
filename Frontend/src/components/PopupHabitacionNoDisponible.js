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
    <div className="modalOverlayReservaError">
      <div className="modalContentErrorReserva">
        <div className="modalTitleErrorReserva">
          {titulo}
        </div>
        <div className="modalBodyErrorReserva">
          {sujeto} {verbo} {complemento}{" "}
          <strong>{textoRango}</strong>.{" "}
          Por favor, elija otra habitación o modifique las fechas de búsqueda.
        </div>
        <div className="modalButtonsErrorReserva">
          <button
            className="modalButtonBase modalButtonErrorReserva"
            onClick={onClose}
            type="button"
          >
            Volver a la selección
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupHabitacionNoDisponible;
