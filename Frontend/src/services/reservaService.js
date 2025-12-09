// src/services/reservaService.js

// Base del backend (podés setear REACT_APP_API_URL en .env)
const API_ROOT = "http://localhost:8080";

// Endpoints
const HABITACIONES_API = `${API_ROOT}/api/habitaciones`;
const RESERVAS_API = `${API_ROOT}/api/reservas`;
// Importante: el controller está en /api/habitaciones/estado
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

const addOneDayIso = (iso) => {
  if (!iso) return iso;
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + 1);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
};

const subOneDayIso = (iso) => {
  if (!iso) return iso;
  const [y, m, d] = iso.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() - 1);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
};

const toIso = (valor, fallbackYear) => {
  if (!valor) return null;
  const s = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return `${y}-${m}-${d}`;
  }
  if (/^\d{2}\/\d{2}$/.test(s) && fallbackYear) {
    const [d, m] = s.split("/");
    return `${fallbackYear}-${m}-${d}`;
  }
  return null;
};

// ---------------------------------------------------------------------------
// Consulta de disponibilidad (real) - CU-04 incluye CU-05
// ---------------------------------------------------------------------------
export const buscarDisponibilidad = async (fechaDesdeIso, fechaHastaIso) => {
  // Enviamos desde-1 / hasta+1 para compensar backend exclusivo y luego filtramos
  const params = {
    desde: subOneDayIso(fechaDesdeIso),
    hasta: addOneDayIso(fechaHastaIso),
  };

  // Llamada al backend con fetch
  const data = await getJson(HAB_ESTADO_API, params);
  // data: { grupos, filas, dias, desde, hasta }

  // Filtramos filas para mostrar solo entre desde/hasta inclusive
  if (Array.isArray(data.filas) && (fechaDesdeIso || fechaHastaIso)) {
    const limiteDesde = fechaDesdeIso || null;
    const limiteHasta = fechaHastaIso || null;
    data.filas = data.filas.filter((fila) => {
      const dia = fila.dia ?? fila.fecha ?? fila.day;
      const iso = toIso(dia, fechaHastaIso ? fechaHastaIso.split("-")[0] : null);
      if (!iso) return false;
      const okDesde = limiteDesde ? iso >= limiteDesde : true;
      const okHasta = limiteHasta ? iso <= limiteHasta : true;
      return okDesde && okHasta;
    });
  }

  // Orden de columnas según los grupos (tipoHabitacion)
  const columnas = (data.grupos ?? []).flatMap((g) =>
    (g.habitaciones ?? []).map((h) => ({
      nro: `${h.id.nroPiso}-${h.id.nroHabitacion}`,
      tipo: g.tipoHabitacion,
    }))
  );

  // Armar grilla con fechas y habitaciones en el mismo orden de columnas
  const grid = (data.filas ?? []).map((fila) => {
    const fecha = formatDateDMY(fila.dia || fila.fecha || fila.day);
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
// Confirmar reserva - CU-04 (pasos 21-32)
// ---------------------------------------------------------------------------
export const confirmarReserva = async (payload) => {
  const data = await postJson(RESERVAS_API, payload);
  return data;
};
