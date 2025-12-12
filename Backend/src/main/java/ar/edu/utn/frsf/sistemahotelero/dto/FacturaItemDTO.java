// dto/facturacion/FacturaItemDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import lombok.Data;

@Data
public class FacturaItemDTO {
    private String id;          // "ESTADIA" o "SERV-<idServicio>"
    private String descripcion;
    private Double monto;
    private String tipo;        // ESTADIA / SERVICIO
    private boolean incluido;
}
