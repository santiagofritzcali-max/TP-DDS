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

//PARA MODIFICAR HUESPED
export async function actualizarHuesped(
  form,
  { aceptarDuplicado = false, original } = {}
) {

  const payload = {
    ...form,
  };

  if (aceptarDuplicado) {
    payload.aceptarDuplicado = true;
  }

  // datos originales de identificación (tipoDoc + nroDoc que venían de CU02)
  // sirve al back para saber a quién actualizar, incluso si se cambió el doc
  if (original) {
    payload.oldTipoDoc = original.tipoDoc;
    payload.oldNroDoc = original.nroDoc;
  }

  const result = await apiRequest('/huespedes', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });


  return result;
}


//PARA DAR DE BAJA HUESPED
export async function eliminarHuesped(tipoDoc, nroDoc) {
  const result = await apiRequest(`/huespedes/${tipoDoc}/${nroDoc}`, {
    method: 'DELETE',
  });

  // el back devuelve un mensaje
  if (!result.ok) {
    // en error, el mensaje seguramente viene en result.data o result.error
    const msg = result.error || result.data || 'Error al eliminar huésped';
    throw new Error(msg);
  }

  const msgOk =
    (result.data && result.data.message) ||
    'Los datos del huésped han sido eliminados del sistema. Presione cualquier tecla para continuar.';

  return msgOk;
}

//CHEQUEA SI SE PUEDE ELIMINAR (sin eliminar)
export async function puedeEliminarHuesped(tipoDoc, nroDoc) {
  const result = await apiRequest(`/huespedes/${tipoDoc}/${nroDoc}/puede-eliminar`, {
    method: 'GET',
  });

  if (!result.ok) {
    const msg =
      (result.data && result.data.message) ||
      result.error ||
      'No se puede eliminar el huésped.';
    throw new Error(msg);
  }

  return (
    (result.data && result.data.message) ||
    'Se puede eliminar.'
  );
}
