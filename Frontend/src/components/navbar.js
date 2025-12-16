import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getAuthToken } from "../services/authService";
import "../styles/navbarStyle.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = getAuthToken();
  const isLogged = !!token;

  const handleLogout = () => {
    logout();
    navigate("/cu01");
  };

  const homePath = isLogged ? "/" : "/cu01";

  return (
    <header className="topBar">
      <div className="topBarLeft">
        <img
          src="/data/logo-hotel-premier.png"
          alt="Hotel Premier"
          className="logoImage"
        />
      </div>

      <div className="topBarRight">
        <nav>
          <Link to={homePath} className="topBarMenuLink">
            Inicio
          </Link>

          <span className="topBarSeparator">|</span>

          <span className="topBarMenuLink disabled">Reserva</span>
          
          <span className="topBarSeparator">|</span>

          <span className="topBarMenuLink disabled">Ayuda</span>

          <span className="topBarSeparator">|</span>

          {isLogged ? (
            <button className="topBarMenuLink asLinkButton" type="button" onClick={handleLogout}>
              Salir
            </button>
          ) : (
            <Link to="/cu01" className="topBarMenuLink">
              Iniciar Sesion
            </Link>
          )}

        </nav>

        {isLogged ? (
          <span className="btnSmallDark">Conserje</span>
        ):( 
          null
        )}
      </div>
    </header>
  );
};

export default Navbar;
