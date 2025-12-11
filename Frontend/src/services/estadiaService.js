import { apiRequest } from "./apiClient";

export async function ocuparHabitacion(requestBody) {
  const result = await apiRequest("/estadias/ocupar", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  if (result.status === 409) {
    return result;
  }

  if (!result.ok) {
    const msg = result.error || "Error al ocupar la habitaci?n.";
    throw new Error(msg);
  }

  return result;
}
