package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class PoliticaCancelacionBasica implements PoliticaCancelacion {

    @Override
    public void validarCancelacion(Reserva reserva) {

        if (reserva == null) {
            throw new IllegalArgumentException("La reserva a cancelar no puede ser nula.");
        }

        LocalDate hoy = LocalDate.now();

        // Regla básica: No se permite cancelar una reserva que ya comenzó
        if (!reserva.getFechaInicio().isAfter(hoy)) {
            throw new IllegalStateException("No se puede cancelar una reserva que ya ha comenzado.");
        }
    }
}

/*El gestor de reservas actúa como contexto y delega la validación a una 
implementación concreta de la política.Esto permite modificar o extender 
las reglas de cancelación sin afectar la lógica principal del caso de uso, 
mejorando la mantenibilidad y el cumplimiento del principio de abierto/cerrado*/