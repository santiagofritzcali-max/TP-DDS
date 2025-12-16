import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbarStyle.css";

const Navbar = () => {
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
          <Link to="/" className="topBarMenuLink">
            Inicio
          </Link>

          <span className="topBarSeparator">|</span>

          <Link to="/cu06" className="topBarMenuLink">
            Cancelar reserva
          </Link>

          <span className="topBarSeparator">|</span>

          <span className="topBarMenuLink disabled">
            Ayuda
          </span>
        </nav>
        
        <button className="btnSmallDark" type="button">
          Conserje
        </button>
      </div>
    </header>
  );
};

export default Navbar;
