/*
// src/validators/validarReservaHabitacion.js

export function validarRangoFechas(desde, hasta) {
  if (!desde || !hasta) {
    return "Debe completar ambas fechas.";
  }

  if (hasta < desde) {
    return "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.";
  }

  return "";
}
*/

// nuevo agregago por lauti
// src/validators/validarReservaHabitacion.js

export function validarRangoFechas(desde, hasta) {
  if (!desde || !hasta) {
    return "Debe completar ambas fechas.";
  }

  // Con input type="date" el formato es yyyy-mm-dd y comparar strings funciona.
  if (hasta < desde) {
    return "La fecha 'Hasta' no puede ser anterior a la fecha 'Desde'.";
  }

  return "";
}
