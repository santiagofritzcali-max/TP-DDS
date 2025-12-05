// ar.edu.utn.frsf.sistemahotelero.service.GestorReserva.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionResponse;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import java.time.LocalDate;
import java.util.List;

public interface GestorReserva {

    List<Reserva> reservarHabitaciones(
            List<String> numerosHabitacion,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String nombre,
            String apellido,
            String telefono
    );

    OcuparHabitacionResponse ocuparHabitacion(OcuparHabitacionRequest request);
}

