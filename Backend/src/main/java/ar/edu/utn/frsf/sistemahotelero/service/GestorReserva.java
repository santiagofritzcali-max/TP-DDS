// ar.edu.utn.frsf.sistemahotelero.service.GestorReserva.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionResponse;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

import java.util.Date;
import java.util.List;

public interface GestorReserva {

    List<Reserva> reservarHabitaciones(
            List<String> numerosHabitacion,
            Date fechaInicio,
            Date fechaFin,
            String nombre,
            String apellido,
            String telefono
    );

    OcuparHabitacionResponse ocuparHabitacion(OcuparHabitacionRequest request);
}

