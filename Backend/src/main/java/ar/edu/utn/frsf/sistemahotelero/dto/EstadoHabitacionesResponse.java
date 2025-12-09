package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class EstadoHabitacionesResponse {
    private LocalDate desde;
    private LocalDate hasta;
    private List<HabitacionEstadoResponse> habitaciones;
}
