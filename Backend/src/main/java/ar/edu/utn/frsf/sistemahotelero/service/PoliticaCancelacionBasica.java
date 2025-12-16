package ar.edu.utn.frsf.sistemahotelero.service;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

@Component
public class PoliticaCancelacionBasica implements PoliticaCancelacion {

    @Override
    public void validarCancelacion(Reserva reserva) {

        if (reserva == null) {
            throw new IllegalArgumentException("La reserva a cancelar no puede ser nula.");
        }

        LocalDate hoy = LocalDate.now();

        
        if (!reserva.getFechaInicio().isAfter(hoy)) {
            throw new IllegalStateException("No se puede cancelar una reserva que ya ha comenzado.");
        }
    }
}

