// src/services/reservaService.js
import axios from "axios";

// Raíz de la API REST del backend
const API_ROOT = "http://localhost:8080/api";
const RESERVAS_API = `${API_ROOT}/reservas`;

// ---------------------------------------------------------------------------
// MOCK local de disponibilidad
// ---------------------------------------------------------------------------
// Mientras no tengamos todavía implementado el endpoint real en el backend,
// usamos esta grilla para simular la respuesta. Cuando el backend esté listo,
// podés borrar todo este bloque y descomentar la llamada con axios de
// 'buscarDisponibilidad'.
const MOCK_GRID = [
  {
    fecha: "28/04",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "ocupada" },
      { nro: "404", estado: "no-disponible" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "29/04",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "reservada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "30/04",
    habitaciones: [
      { nro: "101", estado: "ocupada" },
      { nro: "201", estado: "reservada" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "01/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "reservada" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "02/05",
    habitaciones: [
      { nro: "101", estado: "reservada" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "ocupada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "03/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "reservada" },
      { nro: "404", estado: "ocupada" },
      { nro: "500", estado: "no-disponible" }
    ]
  },
  {
    fecha: "04/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "reservada" },
      { nro: "500", estado: "ocupada" }
    ]
  },
  {
    fecha: "05/05",
    habitaciones: [
      { nro: "101", estado: "disponible" },
      { nro: "201", estado: "disponible" },
      { nro: "301", estado: "disponible" },
      { nro: "404", estado: "disponible" },
      { nro: "500", estado: "ocupada" }
    ]
  }
];

// ---------------------------------------------------------------------------
// Consulta de disponibilidad (pasos 6–16 del DSS de CU-04)
// ---------------------------------------------------------------------------
export const buscarDisponibilidad = async (fechaDesde, fechaHasta) => {
  // Cuando el backend esté disponible, la idea es algo así:
  //
  // const response = await axios.get(`${API_ROOT}/habitaciones/disponibilidad`, {
  //   params: {
  //     fechaDesde,
  //     fechaHasta,
  //   },
  // });
  // return response.data; // adaptar al formato de la grilla si hace falta
  //
  // Por ahora devolvemos el mock local para que la pantalla funcione.
  return MOCK_GRID;
};

// ---------------------------------------------------------------------------
// Confirmar reserva (pasos 21–32 del DSS de CU-04)
// ---------------------------------------------------------------------------
export const confirmarReserva = async (payload) => {
  // payload debería respetar lo que espera tu ReservaDTO en el backend.
  // Ejemplo de forma:
  // {
  //   fechaDesde,
  //   fechaHasta,
  //   nombre,
  //   apellido,
  //   telefonoCompleto,
  //   habitaciones: [
  //     {
  //       numero: "201",
  //       fechaIngreso: "...",
  //       fechaEgreso: "...",
  //       tipo: "DOBLE_ESTANDAR"
  //     },
  //     ...
  //   ]
  // }
  const response = await axios.post(`${RESERVAS_API}/confirmar`, payload);
  return response.data;
};
