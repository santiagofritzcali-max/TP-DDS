// src/services/estadiaService.js

const API_BASE_URL = "http://localhost:8080/api";

export async function ocuparHabitacion(requestBody) {
  const response = await fetch(`${API_BASE_URL}/estadias/ocupar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    // intento leer mensaje de error del backend
    let msg = "Error al ocupar la habitación.";
    try {
      const dataError = await response.json();
      if (dataError.mensaje) msg = dataError.mensaje;
    } catch (_) {}
    throw new Error(msg);
  }

  return await response.json(); // OcuparHabitacionResponse
}
