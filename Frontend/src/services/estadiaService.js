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

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (response.status === 409) {
    return { status: response.status, data };
  }

  if (!response.ok) {
    let msg = "Error al ocupar la habitaci?n.";
    if (data && data.mensaje) msg = data.mensaje;
    throw new Error(msg);
  }

  return { status: response.status, data };
}
