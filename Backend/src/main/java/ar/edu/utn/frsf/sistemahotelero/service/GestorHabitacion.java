package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import ar.edu.utn.frsf.sistemahotelero.util.HabitacionKeyUtil;

import java.time.LocalDate;
import java.util.List;

public interface GestorHabitacion {

    List<Habitacion> buscarPorEstado(EstadoHabitacion estado);

    // ✅ versión correcta (PK compuesta)
    void actualizarEstado(HabitacionId id, EstadoHabitacion nuevoEstado);

    // ✅ compatibilidad: NO rompe tus llamados actuales con String
    default void actualizarEstado(String habitacionKey, EstadoHabitacion nuevoEstado) {
        actualizarEstado(HabitacionKeyUtil.parse(habitacionKey), nuevoEstado);
    }

    boolean validarDisponibilidad(Habitacion habitacion, LocalDate fechaInicio, LocalDate fechaFin);
}
