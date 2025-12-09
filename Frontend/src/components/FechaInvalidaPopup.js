import { useEffect, useRef } from "react";
import "../styles/fechaInvalidaPopup.css";

export default function FechaInvalidaPopup({
  open,
  title = "FECHA INVÁLIDA",
  message = "Formato de fecha inválido o inconsistencia entre fecha desde/hasta.",
  buttonText = "Volver",
  onClose,
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    btnRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="fip-overlay" onMouseDown={onOverlayMouseDown}>
      <div className="fip-modal" role="dialog" aria-modal="true">
        <h3 className="fip-title">{title}</h3>
        <p className="fip-message">{message}</p>

        <div className="fip-actions">
          <button
            ref={btnRef}
            className="fip-btn fip-btn--grey"
            onClick={onClose}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
