package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

public class ReservaMapper {

    public static ReservaResponse toResponse(Reserva reserva) {
        ReservaResponse dto = new ReservaResponse();

        dto.setIdReserva(reserva.getId());
        dto.setHabitacionId(
            reserva.getHabitacion() != null
                ? reserva.getHabitacion().getId()
                : null
        );
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());
        dto.setNombre(reserva.getNombre());
        dto.setApellido(reserva.getApellido());
        dto.setTelefono(reserva.getTelefono());

        return dto;
    }
}
