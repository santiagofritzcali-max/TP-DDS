import React from "react";
import "../styles/ui.css";

const Alert = ({ type = "info", className = "", children }) => {
  const classes = ["alert", `alert-${type}`, className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
};

export default Alert;
