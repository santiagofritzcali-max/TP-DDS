package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesResponse;

public interface GestorHabitacion {

    EstadoHabitacionesResponse obtenerEstadoHabitaciones(EstadoHabitacionesRequest request);
}
