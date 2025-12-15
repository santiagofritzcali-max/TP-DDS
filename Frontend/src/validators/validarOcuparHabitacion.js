export function validarOcuparHabitacion(payload) {
  const errores = [];
  const hoyIso = new Date().toISOString().slice(0, 10);

  if (!payload?.nroPiso || !payload?.nroHabitacion) {
    errores.push("Debe seleccionar una habitacion valida.");
  }

  if (!payload?.fechaIngreso || !payload?.fechaEgreso) {
    errores.push("Debe completar fecha de ingreso y egreso.");
  } else {
    const fechaIngreso = String(payload.fechaIngreso).split("T")[0];
    const fechaEgreso = String(payload.fechaEgreso).split("T")[0];

    if (fechaIngreso < hoyIso) {
      errores.push("La fecha de ingreso no puede ser anterior a hoy.");
    }
    if (fechaEgreso < hoyIso) {
      errores.push("La fecha de egreso no puede ser anterior a hoy.");
    }
  }

  if (!payload?.huespedes || payload.huespedes.length === 0) {
    errores.push("Debe seleccionar al menos un huesped antes de continuar.");
  }

  return errores;
}
