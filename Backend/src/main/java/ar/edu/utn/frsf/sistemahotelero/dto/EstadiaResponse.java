package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadiaResponse {

    private String id;

    private LocalDate fechaIngreso;

    private LocalDate fechaEgreso;

    private Integer nroPiso;

    private Integer nroHabitacion;

    private String reservaId; 

    private List<HuespedResponse> huespedes;
}