// src/components/EstadoHabitacionModals.jsx
import React from "react";
import Modal from "./Modal";

const formatDiaCorto = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}`;
};

// Modal de conflicto de reserva (OCUPAR IGUAL / VOLVER)
export const ReservaConflictoModal = ({
  open,
  reservas,
  onOcuparIgual,
  onVolver,
}) => {
  const actions = (
    <>
      <button type="button" className="btn-secondary" onClick={onVolver}>
        Volver
      </button>
      <button type="button" className="btn-primary" onClick={onOcuparIgual}>
        Ocupar igual
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      title="Hay reservas en el rango seleccionado"
      variant="warning"
      actions={actions}
    >
      <p>Los siguientes d??as tienen la habitaci??n reservada:</p>
      <ul>
        {reservas.map((r, idx) => (
          <li key={`${r.dia}-${idx}`}>
            {formatDiaCorto(r.dia)} {r.reservaInfo || "Reserva existente"}
          </li>
        ))}
      </ul>
      <p>??Desea ocupar igualmente la habitaci??n en esos d??as?</p>
    </Modal>
  );
};

// Modal de error (para rango con ocupada / fuera de servicio)
export const ErrorRangoModal = ({ open, mensaje, onAceptar }) => {
  const actions = (
    <button type="button" className="btn-primary" onClick={onAceptar}>
      Aceptar
    </button>
  );

  return (
    <Modal open={open} title="Rango inv??lido" actions={actions} variant="danger">
      <p>{mensaje}</p>
    </Modal>
  );
};
