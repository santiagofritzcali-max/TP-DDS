import { getAuthToken } from "./apiClient";

const API_ROOT = "http://localhost:8080";
const ESTADO_HAB_API = `${API_ROOT}/api/habitaciones/estado`;

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

export const obtenerEstadoHabitaciones = async (fechaDesdeIso, fechaHastaIso) => {
  // Ajuste: enviamos hasta +1 día (backend trata fecha final como exclusiva) y luego filtramos en front.
  const params = new URLSearchParams({
    desde: subOneDayIso(fechaDesdeIso),
    hasta: addOneDayIso(fechaHastaIso),
  });

  const url = `${ESTADO_HAB_API}?${params.toString()}`;
  console.log("GET estado habitaciones:", url);

  const token = getAuthToken();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Error HTTP:", response.status, text);
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data = await response.json();

  // Filtramos filas para mostrar solo entre desde/hasta inclusive, comparando por ISO.
  if (Array.isArray(data.filas) && (fechaHastaIso || fechaDesdeIso)) {
    const toIso = (valor) => {
      if (!valor) return null;
      const s = String(valor);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split("/");
        return `${y}-${m}-${d}`;
      }
      if (/^\d{2}\/\d{2}$/.test(s) && fechaHastaIso) {
        const [d, m] = s.split("/");
        const [yHasta] = fechaHastaIso.split("-");
        return `${yHasta}-${m}-${d}`;
      }
      return null;
    };

    const limiteHasta = fechaHastaIso || null;
    const limiteDesde = fechaDesdeIso || null;

    data.filas = data.filas.filter((fila) => {
      const dia = fila.dia || fila.fecha || fila.day;
      const iso = toIso(dia);
      if (!iso) return false;
      const dentroDesde = limiteDesde ? iso >= limiteDesde : true;
      const dentroHasta = limiteHasta ? iso <= limiteHasta : true;
      return dentroDesde && dentroHasta;
    });
  }

  return data;
};
