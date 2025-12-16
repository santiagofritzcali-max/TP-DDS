// src/services/notaCreditoService.js
import { apiRequest } from "./apiClient";

export async function buscarFacturasPendientes({ cuit, tipoDoc, nroDoc }) {
  const params = new URLSearchParams();
  if (cuit) params.append("cuit", cuit);
  if (tipoDoc) params.append("tipoDoc", tipoDoc);
  if (nroDoc) params.append("nroDoc", nroDoc);
  const query = params.toString();
  const result = await apiRequest(`/notas-credito/pendientes${query ? `?${query}` : ""}`, {
    method: "GET",
  });
  return result;
}

export async function generarNotaCredito(payload) {
  const result = await apiRequest("/notas-credito", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result;
}
