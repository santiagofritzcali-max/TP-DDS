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
  // Ajuste: ensanchamos el rango al backend (desde-1, hasta+1) y luego filtramos en front.
  const params = new URLSearchParams({
    desde: subOneDayIso(fechaDesdeIso),
    hasta: addOneDayIso(fechaHastaIso),
  });

  const url = `${ESTADO_HAB_API}?${params.toString()}`;
  console.log("GET estado habitaciones:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Error HTTP:", response.status, text);
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data = await response.json();

  // Filtramos filas para no mostrar la fila extra del día hasta+1
  if (Array.isArray(data.filas) && fechaHastaIso) {
    const parseFecha = (valor) => {
      if (!valor) return null;
      const s = String(valor);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-");
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split("/");
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
      if (/^\d{2}\/\d{2}$/.test(s)) {
        const [d, m] = s.split("/");
        // Asumimos mismo año que fechaHastaIso
        const [yHasta] = fechaHastaIso.split("-");
        return new Date(Number(yHasta), Number(m) - 1, Number(d));
      }
      return null;
    };

    const limiteHasta = parseFecha(fechaHastaIso);
    const limiteDesde = fechaDesdeIso ? parseFecha(fechaDesdeIso) : null;

    data.filas = data.filas.filter((fila) => {
      const diaIso = fila.dia || fila.fecha || fila.day;
      if (!diaIso) return false;
      const d = parseFecha(diaIso);
      if (!d) return true;
      const dentroHasta = d <= limiteHasta;
      const dentroDesde = limiteDesde ? d >= limiteDesde : true;
      return dentroDesde && dentroHasta;
    });
  }

  return data;
};
