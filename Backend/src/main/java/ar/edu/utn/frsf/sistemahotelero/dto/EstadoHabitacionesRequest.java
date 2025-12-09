package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class EstadoHabitacionesRequest {
    private LocalDate desde;
    private LocalDate hasta;
}
