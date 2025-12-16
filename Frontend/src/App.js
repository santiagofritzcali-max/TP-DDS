import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import CancelarReservaPage from "./pages/CancelarReservaPage";
import LoginPage from "./pages/LoginPage";
import { getAuthToken } from "./services/authService";

import "./App.css";

const RequireAuth = ({ children }) => {
  const token = getAuthToken();
  if (!token) return <Navigate to="/cu01" replace />;
  return children;
};

function App() {
  const token = getAuthToken();

  return (
    <BrowserRouter>
      <div className="app-root">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu02"
              element={
                <RequireAuth>
                  <BusquedaHuespedPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu03"
              element={
                <RequireAuth>
                  <BuscarResponsablePage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu04"
              element={
                <RequireAuth>
                  <ReservarHabitacionPage />
                </RequireAuth>
              }
            />

            <Route
              path="/datos-reserva"
              element={
                <RequireAuth>
                  <DatosReservaPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu05"
              element={
                <RequireAuth>
                  <EstadoHabitacionesPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu06"
              element={
                <RequireAuth>
                  <CancelarReservaPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu07"
              element={
                <RequireAuth>
                  <FacturarPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu09"
              element={
                <RequireAuth>
                  <AltaHuespedPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu10"
              element={
                <RequireAuth>
                  <ModificarHuespedPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu12"
              element={
                <RequireAuth>
                  <AltaResponsablePage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu13"
              element={
                <RequireAuth>
                  <ModificarResponsablePage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu13/:id"
              element={
                <RequireAuth>
                  <ModificarResponsablePage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu15"
              element={
                <RequireAuth>
                  <OcuparHabitacionPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu16"
              element={
                <RequireAuth>
                  <IngresarPagoPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu19"
              element={
                <RequireAuth>
                  <IngresarNotaCreditoPage />
                </RequireAuth>
              }
            />

            <Route
              path="/cu01"
              element={token ? <Navigate to="/" replace /> : <LoginPage />}
            />
            
            
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
