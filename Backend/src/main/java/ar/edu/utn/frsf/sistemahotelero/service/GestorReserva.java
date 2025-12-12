package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import java.util.List;

public interface GestorReserva {

    /**
     * CU04 – Reservar habitaciones
     * Recibe una lista de reservas, cada una con:
     *  - número de habitación (piso-numero, ej: "1-201")
     *  - fechaInicio / fechaFin propias
     */
    List<Reserva> reservarHabitaciones(
            List<ReservaHabitacionRequest> reservasRequest,
            String nombre,
            String apellido,
            String telefono
    );

    /**
     * CU05 – Ocupar habitación
     * (ya lo tenías, lo dejamos igual)
     */
    EstadiaOcuparResponse ocuparHabitacion(EstadiaOcuparRequest request);
    
    //Para CU06
    List<Reserva> buscarReservas(String apellido, String nombre);

    List<Reserva> cancelarReservas(List<Long> idsReservas);

}
