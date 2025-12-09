package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadiaOcuparResponse {

    private Long estadiaId;
    
    private Integer nroPiso;
    private Integer nroHabitacion; 
    
    private LocalDate fechaIngreso;
    private LocalDate fechaEgreso;
    
    private String mensaje;
}
