import { apiRequest } from "./apiClient";

export async function buscarOcupantes(numeroHabitacion, fechaEgreso) {
  return apiRequest(
    `/facturacion/ocupantes?numeroHabitacion=${encodeURIComponent(
      numeroHabitacion
    )}&fechaEgreso=${encodeURIComponent(fechaEgreso)}`
  );
}

export async function prepararFactura(payload) {
  return apiRequest("/facturacion/previsualizacion", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generarFactura(payload) {
  return apiRequest("/facturacion", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

