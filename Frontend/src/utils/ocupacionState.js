/**
 * Arma el state de navegación para CU-15 (OcuparHabitacionPage)
 */
export const buildOcuparNavigationState = ({
  habitacionId,
  fechaIngreso,
  fechaEgreso,
  ocupaSobreReserva = false,
  reservaInfo = null,
} = {}) => ({
  desdeCU15: true,
  numeroHabitacion: habitacionId,
  fechaIngreso,
  fechaEgreso,
  ocupaSobreReserva,
  reservaInfo,
});

/**
 * Normaliza el state recibido en CU-15
 */
export const parseOcuparNavigationState = (state = {}) => ({
  numeroHabitacion: state.numeroHabitacion || "",
  fechaIngreso: state.fechaIngreso || "",
  fechaEgreso: state.fechaEgreso || "",
  ocupaSobreReserva: state.ocupaSobreReserva || false,
  reservaInfo: state.reservaInfo || null,
});
