import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/forms.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Credenciales invalidas");
      setUsername("");
      setPassword("");
      return;
    }
    navigate("/");
  };

  return (
    <div className="formContainer">
      <h2>Autenticar Usuario</h2>
      <form className="formCard" onSubmit={handleSubmit}>
        <label className="formLabel">
          Usuario
          <input
            className="formInput"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="formLabel">
          Contrasena
          <input
            className="formInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <div className="formError">{error}</div>}

        <button className="btnPrimary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
