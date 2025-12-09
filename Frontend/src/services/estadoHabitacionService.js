const API_ROOT = "http://localhost:8080";
const ESTADO_HAB_API = `${API_ROOT}/api/habitaciones/estado`;

export const obtenerEstadoHabitaciones = async (fechaDesdeIso, fechaHastaIso) => {
  const params = new URLSearchParams({
    desde: fechaDesdeIso,
    hasta: fechaHastaIso,
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

  return await response.json();
};
