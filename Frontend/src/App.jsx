import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importar Router

// Asegúrate de importar las páginas que necesitas
import AltaHuespedPage from './app/huespedes/alta';  // Asegúrate de tener la ruta correcta
import BusquedaHuespedPage from './app/huespedes/busqueda';  // La página de búsqueda

function App() {
  return (
    <Router> {/* Definir el Router para gestionar las rutas */}
      <Routes>
        {/* Definir las rutas para tus páginas */}
        <Route path="/" element={<AltaHuespedPage />} /> {/* Página principal o de alta por defecto */}
        <Route path="/huespedes/alta" element={<AltaHuespedPage />} /> {/* Ruta para la página de alta */}
        <Route path="/huespedes/buscar" element={<BusquedaHuespedPage />} /> {/* Ruta para la página de búsqueda */}
      </Routes>
    </Router>
  );
}

export default App;
