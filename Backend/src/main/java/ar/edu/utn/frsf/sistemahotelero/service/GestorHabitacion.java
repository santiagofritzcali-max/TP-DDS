package ar.edu.utn.frsf.sistemahotelero.service;

import java.time.LocalDate;
import java.util.List;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import ar.edu.utn.frsf.sistemahotelero.util.HabitacionKeyUtil;

public interface GestorHabitacion {

    List<Habitacion> buscarPorEstado(EstadoHabitacion estado);

    
    void actualizarEstado(HabitacionId id, EstadoHabitacion nuevoEstado);

    
    default void actualizarEstado(String habitacionKey, EstadoHabitacion nuevoEstado) {
        actualizarEstado(HabitacionKeyUtil.parse(habitacionKey), nuevoEstado);
    }

    boolean validarDisponibilidad(Habitacion habitacion, LocalDate fechaInicio, LocalDate fechaFin);
}
