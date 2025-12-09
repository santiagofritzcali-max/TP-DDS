/*
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
*/



// nuevo lauti
// src/services/reservaService.js
import axios from "axios";

// Base del backend (podés setear REACT_APP_API_URL en .env)
const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Endpoints
const HABITACIONES_API = `${API_ROOT}/api/habitaciones`;
const RESERVAS_API = `${API_ROOT}/api/reservas`;

// Piso fijo (según tu regla: consultas sobre un único piso)
export const PISO_FIJO = 1;

// Orden fijo de columnas (coincide con tu UI actual)
const ROOMS_ORDER = ["101", "201", "301", "404", "500"];

/**
 * "yyyy-mm-dd" (input date) -> "dd/MM/yyyy" (back)
 */
function isoToDdMmYyyy(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

/**
 * "2025-12-08" -> "08/12"
 * Si ya viene "dd/MM", lo deja como está.
 */
function dayLabel(value) {
  if (!value) return "";
  const s = String(value);
  if (/^\d{2}\/\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [, mm, dd] = s.split("-");
    return `${dd}/${mm}`;
  }
  return s;
}

/**
 * Extrae nroHabitacion desde distintas formas posibles:
 * - habitacionId = { nroPiso, nroHabitacion }
 * - habitacionId = "1-101" o "101"
 * - habitacionNumero / numeroHabitacion
 */
function extraerNroHabitacion(celda) {
  if (!celda) return null;

  if (celda.habitacionNumero != null) return String(celda.habitacionNumero);
  if (celda.numeroHabitacion != null) return String(celda.numeroHabitacion);

  const hid = celda.habitacionId;

  if (hid && typeof hid === "object") {
    if (hid.nroHabitacion != null) return String(hid.nroHabitacion);
    if (hid.numeroHabitacion != null) return String(hid.numeroHabitacion);
  }

  if (hid != null) {
    const v = String(hid);
    if (v.includes("-")) {
      const parts = v.split("-");
      return String(parts[parts.length - 1]);
    }
    return v;
  }

  return null;
}

/**
 * Back -> front:
 * - "Disponible" -> "disponible"
 * - "Reservada"  -> "reservada"
 * - "Ocupada"    -> "ocupada"
 * - "FueraServicio" -> "fuera-servicio"
 */
function normalizarEstado(estadoRaw) {
  const raw = (estadoRaw ?? "").toString().trim();
  const compact = raw.replace(/[\s_-]/g, "").toLowerCase();

  if (compact.includes("fueraservicio")) return "fuera-servicio";
  if (compact.includes("reserv")) return "reservada";
  if (compact.includes("ocup")) return "ocupada";
  if (compact.includes("dispon")) return "disponible";

  // Si viene algo raro, lo tratamos como no seleccionable
  return "fuera-servicio";
}

/**
 * Convierte la respuesta del backend a tu formato de grilla:
 * [
 *   { fecha:"dd/MM", habitaciones:[{nro:"101", estado:"..."}, ...] },
 *   ...
 * ]
 */
function toGridEstadoHabitaciones(data) {
  const filas = Array.isArray(data?.filas) ? data.filas : [];

  return filas.map((fila) => {
    const fecha = dayLabel(fila.dia ?? fila.fecha ?? fila.day);

    const estadoPorNro = new Map();
    const celdas = Array.isArray(fila.celdas) ? fila.celdas : [];

    for (const celda of celdas) {
      const nro = extraerNroHabitacion(celda);
      if (!nro) continue;
      estadoPorNro.set(String(nro), normalizarEstado(celda.estado));
    }

    return {
      fecha,
      habitaciones: ROOMS_ORDER.map((nro) => ({
        nro,
        estado: estadoPorNro.get(nro) ?? "fuera-servicio",
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// Consulta de disponibilidad (real)
// ---------------------------------------------------------------------------
export const buscarDisponibilidad = async (fechaDesdeIso, fechaHastaIso) => {
  const desde = isoToDdMmYyyy(fechaDesdeIso);
  const hasta = isoToDdMmYyyy(fechaHastaIso);

  const response = await axios.get(`${HABITACIONES_API}/estado`, {
    params: { desde, hasta },
  });

  // Tu backend devuelve una estructura por filas/celdas -> adaptamos
  return toGridEstadoHabitaciones(response.data);
};

// ---------------------------------------------------------------------------
// Confirmar reserva (lo dejo igual; ajustalo cuando tengas el endpoint real)
// ---------------------------------------------------------------------------
export const confirmarReserva = async (payload) => {
  const response = await axios.post(`${RESERVAS_API}/confirmar`, payload);
  return response.data;
};
