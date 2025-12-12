package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
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
    
    // CU06 - Mapper para la grilla de Cancelar Reserva
    public static CancelarReservaItemDTO toCancelarItem(Reserva reserva) {

        if (reserva == null) return null;

        CancelarReservaItemDTO dto = new CancelarReservaItemDTO();

        dto.setIdReserva(reserva.getId());
        dto.setApellido(reserva.getApellido());
        dto.setNombre(reserva.getNombre());
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());

        Habitacion hab = reserva.getHabitacion();
        if (hab != null && hab.getId() != null) {

            // Ejemplo: "1-301"
            String numeroHabitacion = hab.getId().getNroPiso() + "-" + hab.getId().getNroHabitacion();

            dto.setNumeroHabitacion(numeroHabitacion);

            // Tipo de habitación 
            if (hab.getTipoHabitacion() != null) dto.setTipoHabitacion(hab.getTipoHabitacion().toString());
        }

        return dto;
    }
}

