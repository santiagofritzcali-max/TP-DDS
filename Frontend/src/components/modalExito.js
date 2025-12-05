import React from 'react';
import '../styles/altaHuespedStyle.css'; // mismo CSS que usa AltaHuespedPage

const ModalExito = ({ isOpen, onConfirm, nombreHuesped }) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modalSuccess">
        <div className="modalTitleSuccess">Operación Exitosa</div>
        <div className="modalBodySuccess">
          El huésped <strong>{nombreHuesped}</strong> fue dado de alta correctamente.
        </div>
        <div className="modalButtonsSuccess">
          <button onClick={onConfirm} className="btnPrimary">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExito;
