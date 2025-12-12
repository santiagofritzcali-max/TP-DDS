// dto/facturacion/CrearFacturaRequestDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import java.util.List;
import lombok.Data;

@Data
public class CrearFacturaRequestDTO {
    private Long estadiaId;
    private Long responsableId;
    private List<String> idsItemsSeleccionados;
}
