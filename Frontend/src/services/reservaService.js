// src/services/reservaService.js
import axios from "axios";

// Raíz de la API REST del backend
const API_ROOT = "http://localhost:8080/api";
const RESERVAS_API = `${API_ROOT}/reservas`;
const HAB_ESTADO_API = `${API_ROOT}/habitaciones/estado`;


//Formato de fecha compatible con el backend
const formatDateDMY = (isoDate) => {
  // isoDate = "2025-12-10"
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
};

const mapEstado = (estadoEnum) => {
  switch (estadoEnum) {
    case "Reservada": return "reservada";
    case "Ocupada": return "ocupada";
    case "Disponible": return "disponible";
    case "FueraServicio": return "no-disponible";
    default: return "no-disponible";
  }
};

// Consulta de disponibilidad (pasos 6–16 del DSS de CU-04)
export const buscarDisponibilidad = async (fechaDesdeIso, fechaHastaIso) => {
  const params = { desde: fechaDesdeIso, hasta: fechaHastaIso };

  const { data } = await axios.get(HAB_ESTADO_API, { params });
  // data: { grupos, filas, dias, desde, hasta }

  // Orden de columnas según los grupos (tipoHabitacion) 21:08
  const columnas = data.grupos.flatMap((g) =>
  g.habitaciones.map((h) => ({
    nro: `${h.id.nroPiso}-${h.id.nroHabitacion}`,
    tipo: g.tipoHabitacion, // <-- agregar esta línea
  }))
);

  // Armar grilla con fechas y habitaciones en el mismo orden de columnas
  const grid = data.filas.map((fila) => {
    const fecha = formatDateDMY(fila.dia); // fila.dia viene en yyyy-MM-dd
    const habitaciones = columnas.map((col) => {
      const celda = fila.celdas.find(
        (c) =>
          c.habitacionId.nroPiso === parseInt(col.nro.split("-")[0], 10) &&
          c.habitacionId.nroHabitacion === parseInt(col.nro.split("-")[1], 10)
      );
      return {
        nro: col.nro,
        estado: mapEstado(celda?.estado),
      };
    });
    return { fecha, habitaciones };
  });

  return { grid, columnas };
};



// Confirmar reserva, pasos 21–32 del digrama de secuencia del CU-04
export const confirmarReserva = async (payload) => {
  const { data } = await axios.post(RESERVAS_API, payload);
  return data;
};
