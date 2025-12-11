import React from "react";
import "../styles/ui.css";

const Button = ({
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  children,
  ...rest
}) => {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
