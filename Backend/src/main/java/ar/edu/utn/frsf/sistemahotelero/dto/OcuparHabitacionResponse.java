package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcuparHabitacionResponse {

    private Long estadiaId;
    private Integer numeroHabitacion;
    private LocalDate fechaIngreso;
    private LocalDate fechaEgreso;
    private String mensaje;
}
