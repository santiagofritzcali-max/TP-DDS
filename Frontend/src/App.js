import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";

import HomePage from "./pages/HomePage";
import BusquedaHuespedPage from "./pages/BusquedaHuespedPage";
import AltaHuespedPage from "./pages/AltaHuespedPage";
import ModificarHuespedPage from "./pages/ModificarHuespedPage";
import ReservarHabitacionPage from "./pages/ReservarHabitacionPage";
import EstadoHabitacionesPage from "./pages/EstadoHabitacionPage";
import DatosReservaPage from "./pages/DatosReservaPage";

import OcuparHabitacionPage from "./pages/OcuparHabitacionPage";
import FacturarPage from "./pages/FacturarPage";
import BuscarResponsablePage from "./pages/BuscarResponsablePage";
import AltaResponsablePage from "./pages/AltaResponsablePage";
import ModificarResponsablePage from "./pages/ModificarResponsablePage";
import IngresarPagoPage from "./pages/IngresarPagoPage";
import IngresarNotaCreditoPage from "./pages/IngresarNotaCreditoPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar />

        <main className="app-main">
          <Routes>

            <Route path="/" element={<HomePage />} />

            <Route path="/cu02" element={<BusquedaHuespedPage />} />

            <Route path="/cu04" element={<ReservarHabitacionPage />} />

            <Route path="/datos-reserva" element={<DatosReservaPage />} />

            <Route path="/cu05" element={<EstadoHabitacionesPage />} />

            <Route path="/cu07" element={<FacturarPage />} />
            <Route path="/cu03" element={<BuscarResponsablePage />} />
            <Route path="/cu12" element={<AltaResponsablePage />} />
            <Route path="/cu13" element={<ModificarResponsablePage />} />
            <Route path="/cu13/:id" element={<ModificarResponsablePage />} />

            <Route path="/cu09" element={<AltaHuespedPage />} />

            <Route path="/cu10" element={<ModificarHuespedPage />} />

            <Route path="/cu15" element={<OcuparHabitacionPage />} />
            <Route path="/cu16" element={<IngresarPagoPage />} />
            <Route path="/cu19" element={<IngresarNotaCreditoPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
