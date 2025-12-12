// dto/facturacion/OcupanteDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import lombok.Data;

@Data
public class OcupanteDTO {
    private HuespedIdDTO huespedId;
    private String nombreCompleto;
    private String tipoDocumento;
    private String nroDocumento;
    private boolean mayorDeEdad;
}
