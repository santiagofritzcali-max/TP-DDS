/**
 * Devuelve una descripción legible del titular de una reserva
 * a partir de la celda del backend (raw + reservaInfo).
 */
export const getReservaDescripcion = (cell) => {
  if (!cell || cell.slug !== "reservada") return "";

  const raw = cell.raw || {};
  const info = raw.reservaInfo || {};

  const apellido =
    info.apellido ??
    raw.apellidoHuesped ??
    raw.apellidoTitular ??
    raw.huespedPrincipal?.apellido ??
    "";
  const nombre =
    info.nombre ??
    raw.nombreHuesped ??
    raw.nombreTitular ??
    raw.huespedPrincipal?.nombre ??
    "";
  const telefono = info.telefono ?? raw.telefono ?? raw.huespedPrincipal?.telefono ?? "";
  const docTipo = raw.tipoDoc ?? raw.huespedPrincipal?.tipoDoc ?? "";
  const docNro = raw.nroDoc ?? raw.huespedPrincipal?.nroDoc ?? "";

  const base = [apellido, nombre].filter(Boolean).join(", ").trim();
  const contacto = telefono ? ` - ${telefono}` : "";
  const doc = docTipo || docNro ? ` (${docTipo} ${docNro})` : "";

  const descripcion = `${base}${contacto}${doc}`.trim();
  return descripcion || "Reserva existente";
};
