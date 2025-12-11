package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;

public record EstadoHabitacionesResponse(
        LocalDate desde,
        LocalDate hasta,
        List<LocalDate> dias,
        List<GrupoHabitaciones> grupos,
        List<FilaDia> filas
) {
    public record HabitacionKey(Integer nroPiso, Integer nroHabitacion) {}
    public record GrupoHabitaciones(String tipoHabitacion, List<HabitacionCol> habitaciones) {}
    public record HabitacionCol(HabitacionKey id, String numero) {}

    public record ReservaInfo(
            Long id,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String nombre,
            String apellido,
            String telefono
    ) {}

    public record FilaDia(LocalDate dia, List<Celda> celdas) {}
    public record Celda(HabitacionKey habitacionId, String estado, ReservaInfo reservaInfo) {}
}
