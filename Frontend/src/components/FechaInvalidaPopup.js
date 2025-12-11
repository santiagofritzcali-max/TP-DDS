import { useEffect, useRef } from "react";
import Modal from "./Modal";
import "../styles/FechaInvalidaPopup.css";

export default function FechaInvalidaPopup({
  open,
  title = "FECHA INVALIDA",
  message = "Formato de fecha invalido o inconsistencia entre fecha desde/hasta.",
  buttonText = "Volver",
  onClose,
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    btnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      title={title}
      variant="danger"
      onClose={onClose}
      actions={
        <button
          ref={btnRef}
          className="btnPrimary"
          onClick={onClose}
          type="button"
        >
          {buttonText}
        </button>
      }
    >
      <p className="fip-message">{message}</p>
    </Modal>
  );
}
