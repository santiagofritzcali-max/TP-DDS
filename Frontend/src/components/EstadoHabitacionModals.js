// src/components/EstadoHabitacionModals.jsx
import React from "react";

// Modal de conflicto de reserva (OCUPAR IGUAL / VOLVER)
export const ReservaConflictoModal = ({ open, reservas, onOcuparIgual, onVolver }) => {
  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  };

  const boxStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    maxWidth: "420px",
    width: "100%",
  };

  const actionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "1rem",
  };

  const formatDiaCorto = (iso) => {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-");
    return `${d}/${m}`;
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2>Hay reservas en el rango seleccionado</h2>
        <p>Los siguientes días tienen la habitación reservada:</p>
        <ul>
          {reservas.map((r, idx) => (
            <li key={`${r.dia}-${idx}`}>
              {formatDiaCorto(r.dia)}{" "}
              {r.reservaInfo ? `– ${r.reservaInfo}` : "– Reserva existente"}
            </li>
          ))}
        </ul>
        <p>¿Desea ocupar igualmente la habitación en esos días?</p>

        <div style={actionsStyle}>
          <button type="button" className="btn-secondary" onClick={onVolver}>
            Volver
          </button>
          <button type="button" className="btn-primary" onClick={onOcuparIgual}>
            Ocupar igual
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de error (para rango con ocupada / fuera de servicio)
export const ErrorRangoModal = ({ open, mensaje, onAceptar }) => {
  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  };

  const boxStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    maxWidth: "420px",
    width: "100%",
  };

  const actionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    marginTop: "1rem",
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2>Rango inválido</h2>
        <p>{mensaje}</p>
        <div style={actionsStyle}>
          <button type="button" className="btn-primary" onClick={onAceptar}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
