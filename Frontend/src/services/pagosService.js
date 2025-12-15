import { apiRequest } from "./apiClient";

export async function listarFacturasPendientes(numeroHabitacion) {
  return apiRequest(
    `/pagos/pendientes?numeroHabitacion=${encodeURIComponent(numeroHabitacion)}`
  );
}

export async function registrarPago(payload) {
  return apiRequest("/pagos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
