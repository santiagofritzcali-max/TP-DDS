// src/services/reservaService.js
import axios from "axios";

// Base del backend (podés setear REACT_APP_API_URL en .env)
const API_ROOT = "http://localhost:8080";

// Endpoints
const HABITACIONES_API = `${API_ROOT}/api/habitaciones`;
const RESERVAS_API = `${API_ROOT}/api/reservas`;

// Piso fijo (según tu regla: consultas sobre un único piso)
export const PISO_FIJO = 1;

// Orden fijo de columnas (coincide con tu UI actual)
const ROOMS_ORDER = ["101", "201", "301", "404", "500"];
const HAB_ESTADO_API = `${API_ROOT}/habitaciones/estado`;

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

//Formato de fecha compatible con el backend
const formatDateDMY = (isoDate) => {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
};

const mapEstado = (estadoEnum) => {
  switch (estadoEnum) {
    case "Reservada": return "reservada";
    case "Ocupada": return "ocupada";
    case "Disponible": return "disponible";
    case "FueraServicio": return "no-disponible";
    default: return "no-disponible";
 }
}
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
  const params = { desde: fechaDesdeIso, hasta: fechaHastaIso };

  const { data } = await axios.get(HAB_ESTADO_API, { params });
  // data: { grupos, filas, dias, desde, hasta }

  // Orden de columnas según los grupos (tipoHabitacion) 21:08
  const columnas = data.grupos.flatMap((g) =>
  g.habitaciones.map((h) => ({
    nro: `${h.id.nroPiso}-${h.id.nroHabitacion}`,
    tipo: g.tipoHabitacion, // <-- agregar esta línea
  }))
);

  // Armar grilla con fechas y habitaciones en el mismo orden de columnas
  const grid = data.filas.map((fila) => {
    const fecha = formatDateDMY(fila.dia); // fila.dia viene en yyyy-MM-dd
    const habitaciones = columnas.map((col) => {
      const celda = fila.celdas.find(
        (c) =>
          c.habitacionId.nroPiso === parseInt(col.nro.split("-")[0], 10) &&
          c.habitacionId.nroHabitacion === parseInt(col.nro.split("-")[1], 10)
      );
      return {
        nro: col.nro,
        estado: mapEstado(celda?.estado),
      };
    });
    return { fecha, habitaciones };
  });

  return { grid, columnas};
};

// ---------------------------------------------------------------------------
// Confirmar reserva (lo dejo igual; ajustalo cuando tengas el endpoint real)
// ---------------------------------------------------------------------------
export const confirmarReserva = async (payload) => {
const { data } = await axios.post(RESERVAS_API, payload);
  return data;
};
