package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;

public record EstadoHabitacionesResponse(
        LocalDate desde,
        LocalDate hasta,
        List<LocalDate> dias,
        List<GrupoHabitaciones> grupos,   // columnas agrupadas por tipo
        List<FilaDia> filas               // filas por día
) {
    public record HabitacionKey(Integer nroPiso, Integer nroHabitacion) {}
    public record GrupoHabitaciones(String tipoHabitacion, List<HabitacionCol> habitaciones) {}
    public record HabitacionCol(HabitacionKey id, String numero) {}

    public record FilaDia(LocalDate dia, List<Celda> celdas) {}
    public record Celda(HabitacionKey habitacionId, String estado) {} // "DISPONIBLE"/"RESERVADA"/...
}
