export function validarOcuparHabitacion(payload) {
  const errores = [];

  if (!payload?.nroPiso || !payload?.nroHabitacion) {
    errores.push("Debe seleccionar una habitación válida.");
  }

  if (!payload?.fechaIngreso || !payload?.fechaEgreso) {
    errores.push("Debe completar fecha de ingreso y egreso.");
  }

  if (!payload?.huespedes || payload.huespedes.length === 0) {
    errores.push("Debe seleccionar al menos un huésped antes de continuar.");
  }

  return errores;
}
