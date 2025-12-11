import React from "react";
import "../styles/modal.css";

/**
 * Modal genérico con variantes de estilo.
 * - variant: "default" | "warning" | "danger" | "success" | "info"
 * - actions: nodo de botones o acciones (se alinea a la derecha)
 */
const Modal = ({
  open,
  title,
  children,
  actions = null,
  variant = "default",
  onClose,
  closeOnOverlay = false,
  className = "",
}) => {
  if (!open) return null;

  const palette = {
    warning: {
      bg: "var(--modal-warning-bg, #fff8d6)",
      border: "var(--modal-warning-border, #f6c343)",
      title: "var(--modal-warning-title, #d39e00)",
      color: "#4b3c0b",
    },
    danger: {
      bg: "var(--modal-danger-bg, #ffecec)",
      border: "var(--modal-danger-border, #d32f2f)",
      title: "var(--modal-danger-title, #c62828)",
      color: "#5a1f1f",
    },
    success: {
      bg: "var(--modal-success-bg, #f5fff5)",
      border: "var(--modal-success-border, #7bc47b)",
      title: "var(--modal-success-title, #2e7d32)",
      color: "#1f3b1f",
    },
    info: {
      bg: "var(--modal-info-bg, #e7f3ff)",
      border: "var(--modal-info-border, #99c7ff)",
      title: "var(--modal-info-title, #0a3d91)",
      color: "#0a3d91",
    },
  };

  const variantStyles = palette[variant] || null;
  const handleOverlayClick = (e) => {
    if (!closeOnOverlay) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  const variantClass = variant ? `modal-${variant}` : "";

  return (
    <div
      className={`modal-overlay ${variantClass}`.trim()}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`modal-card ${variantClass ? `${variantClass}-card` : ""} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        style={
          variantStyles
            ? {
                background: variantStyles.bg,
                border: `2px solid ${variantStyles.border}`,
                color: variantStyles.color,
              }
            : undefined
        }
      >
        {title && (
          <div className="modal-header">
            <h3
              className="modal-title"
              style={variantStyles ? { color: variantStyles.title } : undefined}
            >
              {title}
            </h3>
          </div>
        )}

        <div className="modal-body">{children}</div>

        <div className="modal-actions">
          {actions ||
            (onClose && (
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Cerrar
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
