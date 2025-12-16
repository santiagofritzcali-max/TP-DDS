import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/homeStyle.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Panel de Casos de Uso</h1>
      <p className="home-subtitle">
        Selecciona un caso de uso para ejecutarlo.
      </p>

      <div className="home-grid">
        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu02")}
        >
          Ejecutar CU 02
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu04")}
        >
          Ejecutar CU 04
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate('/cu05', { state: { modo: 'soloConsulta' } })}
        >
          Ejecutar CU 05
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu07")}
        >
          Ejecutar CU 07
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu09")}
        >
          Ejecutar CU 09 
        </button>
        
        <button
          className="home-cu-btn"
          onClick={() => navigate('/cu05', { state: { modo: 'desdeCU15' } })}
        >
          Ejecutar CU 15
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu16")}
        >
          Ejecutar CU 16
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu19")}
        >
          Ejecutar CU 19
        </button>
      </div>
    </div>
  );
};

export default HomePage;
