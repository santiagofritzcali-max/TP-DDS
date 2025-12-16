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
          Buscar Huésped
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu04")}
        >
          Reservar Habitación
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate('/cu05', { state: { modo: 'soloConsulta' } })}
        >
          Mostrar Estado de Habitaciones
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu06")}
        >
          Cancelar Reserva
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu07")}
        >
          Facturar
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu09")}
        >
          Dar Alta de Huésped 
        </button>
        
        <button
          className="home-cu-btn"
          onClick={() => navigate('/cu05', { state: { modo: 'desdeCU15' } })}
        >
           Ocupar Habitación
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu16")}
        >
          Ingresar pago
        </button>

        <button
          className="home-cu-btn"
          onClick={() => navigate("/cu19")}
        >
          Ingresar nota de crédito
        </button>
      </div>
    </div>
  );
};

export default HomePage;
