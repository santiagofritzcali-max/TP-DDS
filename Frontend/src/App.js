import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";

import HomePage from "./pages/HomePage";
import BusquedaHuespedPage from "./pages/BusquedaHuespedPage";
import AltaHuespedPage from "./pages/AltaHuespedPage";
import ReservarHabitacionPage from "./pages/ReservarHabitacionPage";
import OcuparHabitacionPage from "./pages/OcuparHabitacionPage";

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

            <Route path="/cu09" element={<AltaHuespedPage />} />

            <Route path="/cu15" element={<OcuparHabitacionPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
