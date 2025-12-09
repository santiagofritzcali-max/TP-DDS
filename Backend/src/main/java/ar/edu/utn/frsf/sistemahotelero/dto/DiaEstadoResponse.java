package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import java.time.LocalDate;
import lombok.Data;

@Data
public class DiaEstadoResponse {
    private LocalDate fecha;
    private EstadoHabitacion estado;

    private Long reservaId;  // opcional, si ese día está reservado
    private Long estadiaId;  // opcional, si ese día está ocupado
}
