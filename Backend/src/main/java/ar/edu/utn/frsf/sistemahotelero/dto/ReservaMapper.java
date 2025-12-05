package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

public class ReservaMapper{
//Convierte una Reserva en un DTO ReservaResponse.

    public static ReservaResponse toResponse(Reserva reserva) {
        ReservaResponse dto = new ReservaResponse();

        dto.setIdReserva(reserva.getId());
        dto.setNumeroHabitacion(reserva.getHabitacion() != null ? reserva.getHabitacion().getNumero() : null);
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());
        dto.setNombre(reserva.getNombre());
        dto.setApellido(reserva.getApellido());
        dto.setTelefono(reserva.getTelefono());

        return dto;
    }
}
