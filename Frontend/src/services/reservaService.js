// src/services/reservaService.js

// Base del backend (podés setear REACT_APP_API_URL en .env)
const API_ROOT = "http://localhost:8080";

// Endpoints
const HABITACIONES_API = `${API_ROOT}/api/habitaciones`;
const RESERVAS_API = `${API_ROOT}/api/reservas`;

// ⚠️ Importante: el controller está en /api/habitaciones/estado
const HAB_ESTADO_API = `${API_ROOT}/api/habitaciones/estado`;

// Piso fijo (según tu regla: consultas sobre un único piso)
export const PISO_FIJO = 1;

// Orden fijo de columnas (por si se usa el helper toGridEstadoHabitaciones)
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
 * - "Disponible"     -> "disponible"
 * - "Reservada"      -> "reservada"
 * - "Ocupada"        -> "ocupada"
 * - "FueraServicio"  -> "fuera-servicio"
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

//Formato de fecha para mostrar en la UI (desde yyyy-MM-dd)
const formatDateDMY = (isoDate) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
};

const mapEstado = (estadoEnum) => {
  switch (estadoEnum) {
    case "Reservada":
      return "reservada";
    case "Ocupada":
      return "ocupada";
    case "Disponible":
      return "disponible";
    case "FueraServicio":
      // en tu CSS lo manejás como "no-disponible"
      return "no-disponible";
    default:
      return "no-disponible";
  }
};

// Helper opcional para mapear otra forma de respuesta
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

/**
 * Helpers genéricos de fetch
 */

async function getJson(url, params = {}) {
  const u = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      u.searchParams.append(key, value);
    }
  });

  const resp = await fetch(u.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Error GET ${u.toString()}: ${resp.status} ${resp.statusText} ${text}`
    );
  }

  return resp.json();
}

async function postJson(url, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Error POST ${url}: ${resp.status} ${resp.statusText} ${text}`
    );
  }

  return resp.json();
}

// ---------------------------------------------------------------------------
// Consulta de disponibilidad (real) – CU-04 incluye CU-05
// ---------------------------------------------------------------------------
export const buscarDisponibilidad = async (fechaDesdeIso, fechaHastaIso) => {
  const params = { desde: fechaDesdeIso, hasta: fechaHastaIso };

  // Llamada al backend con fetch
  const data = await getJson(HAB_ESTADO_API, params);
  // data: { grupos, filas, dias, desde, hasta }

  // Orden de columnas según los grupos (tipoHabitacion)
  const columnas = (data.grupos ?? []).flatMap((g) =>
    (g.habitaciones ?? []).map((h) => ({
      nro: `${h.id.nroPiso}-${h.id.nroHabitacion}`,
      tipo: g.tipoHabitacion,
    }))
  );

  // Armar grilla con fechas y habitaciones en el mismo orden de columnas
  const grid = (data.filas ?? []).map((fila) => {
    const fecha = formatDateDMY(fila.dia); // fila.dia viene en yyyy-MM-dd
    const habitaciones = columnas.map((col) => {
      const [pisoStr, habStr] = col.nro.split("-");
      const piso = parseInt(pisoStr, 10);
      const hab = parseInt(habStr, 10);

      const celda = (fila.celdas ?? []).find(
        (c) =>
          c.habitacionId?.nroPiso === piso &&
          c.habitacionId?.nroHabitacion === hab
      );

      return {
        nro: col.nro,
        estado: mapEstado(celda?.estado),
      };
    });

    return { fecha, habitaciones };
  });

  return { grid, columnas };
};

// ---------------------------------------------------------------------------
// Confirmar reserva – CU-04 (pasos 21–32)
// ---------------------------------------------------------------------------
export const confirmarReserva = async (payload) => {
  // POST con fetch
  const data = await postJson(RESERVAS_API, payload);
  return data;
};
