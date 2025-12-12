// dto/facturacion/BuscarOcupantesResponseDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class BuscarOcupantesResponseDTO {
    private Long estadiaId;
    private Integer numeroHabitacion;
    private LocalDate fechaEgreso;
    private List<OcupanteDTO> ocupantes;
}
