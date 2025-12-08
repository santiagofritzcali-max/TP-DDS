const BASE_URL = 'http://localhost:8080';

//PARA DAR DE ALTA HUESPED
export async function crearHuesped(form, { aceptarDuplicado = false } = {}) {
  const payload = aceptarDuplicado
    ? { ...form, aceptarDuplicado: true }
    : form;

  const resp = await fetch(`${BASE_URL}/api/huespedes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Intentamos parsear el JSON, pero si falla no rompemos
  let data = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  return { resp, data };
}

//PARA BUSCAR HUESPED
export async function buscarHuespedes(form, page = 1) {
  const { apellido = '', nombre = '', nroDoc = '', tipoDoc = '' } = form;

  const resp = await fetch(
    `${BASE_URL}/api/huespedes/busqueda?apellido=${encodeURIComponent(
      apellido
    )}&nombre=${encodeURIComponent(nombre)}&nroDoc=${encodeURIComponent(
      nroDoc
    )}&tipoDoc=${encodeURIComponent(tipoDoc)}&page=${page}`
  );

  if (!resp.ok && resp.status !== 204) {
    throw new Error('Error al realizar la búsqueda.');
  }

  if (resp.status === 204) {
    return { status: 204, data: [] };
  }

  const data = await resp.json();
  return { status: resp.status, data };
}
