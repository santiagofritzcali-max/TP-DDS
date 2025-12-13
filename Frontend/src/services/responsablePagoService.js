import { apiRequest } from "./apiClient";

export async function buscarResponsables({ razonSocial, cuit }) {
  const params = new URLSearchParams();
  if (razonSocial) params.append("razonSocial", razonSocial);
  if (cuit) params.append("cuit", cuit);
  const qs = params.toString();
  return apiRequest(`/responsables${qs ? `?${qs}` : ""}`);
}

export async function obtenerResponsable(id) {
  return apiRequest(`/responsables/${id}`);
}

export async function crearResponsable(payload) {
  return apiRequest("/responsables", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarResponsable(id, payload) {
  return apiRequest(`/responsables/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function eliminarResponsable(id) {
  return apiRequest(`/responsables/${id}`, {
    method: "DELETE",
  });
}

