package ar.edu.utn.frsf.sistemahotelero.service;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import java.time.LocalDate;
import java.util.List;


public interface GestorHabitacion {

    //Buscar habitaciones por estado (DISPONIBLE, RESERVADA
    List<Habitacion> buscarPorEstado(EstadoHabitacion estado);

    //Actualizar el estado de una habitación 
    void actualizarEstado(String numeroHabitacion, EstadoHabitacion nuevoEstado);

    //Validacion de disponibilidad
    boolean validarDisponibilidad(Habitacion habitacion, LocalDate fechaInicio, LocalDate fechaFin);
}
