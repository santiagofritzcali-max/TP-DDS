// src/services/reservaService.js

// IMPORTANTE: ajustá la URL base según tu backend (puerto, contexto, etc.)
const BASE_URL = "http://localhost:8080/api";

/**
 * Busca la disponibilidad de habitaciones en el backend.
 * @param {string} desde - fecha desde (ISO yyyy-mm-dd)
 * @param {string} hasta - fecha hasta (ISO yyyy-mm-dd)
 * @returns {Promise<Array>} grilla de disponibilidad
 */
export async function buscarDisponibilidad(desde, hasta) {
  // >>> Cuando tengas el endpoint real, descomentá esto y adaptá el parseo:
  /*
  const url = `${BASE_URL}/habitaciones/disponibilidad?desde=${desde}&hasta=${hasta}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error al consultar disponibilidad");
  }
  const data = await response.json();
  // transformar 'data' al formato esperado por la pantalla (fecha + habitaciones)
  return transformarRespuestaAGrilla(data);
  */

  // MOCK actual (mismo formato que el INITIAL_GRID del componente)
  return Promise.resolve([
    // acá podrías generar dinámicamente según las fechas
    ...require("../pages/ReservarHabitacionPage").INITIAL_GRID // si prefieres duplicar, copia el array a mano
  ]);
}
