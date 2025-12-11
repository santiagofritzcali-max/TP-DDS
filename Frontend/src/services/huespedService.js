import { apiRequest } from './apiClient';

//PARA DAR DE ALTA HUESPED
export async function crearHuesped(form, { aceptarDuplicado = false } = {}) {
  const payload = aceptarDuplicado ? { ...form, aceptarDuplicado: true } : form;

  const result = await apiRequest('/huespedes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result;
}

//PARA BUSCAR HUESPED
export async function buscarHuespedes(form, page = 1) {
  const { apellido = '', nombre = '', nroDoc = '', tipoDoc = '' } = form;

  const params = new URLSearchParams({ apellido, nombre, nroDoc, tipoDoc, page });

  const result = await apiRequest(`/huespedes/busqueda?${params.toString()}`);

  if (result.status === 204) {
    return { status: 204, data: [] };
  }

  if (!result.ok) {
    throw new Error(result.error || 'Error al realizar la b?squeda.');
  }

  return result;
}
