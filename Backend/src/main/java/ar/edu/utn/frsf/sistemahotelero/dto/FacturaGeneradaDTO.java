// dto/facturacion/FacturaGeneradaDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class FacturaGeneradaDTO {
    private Long facturaId;
    private Integer numero;
    private LocalDate fechaEmision;
    private String tipoFactura;
    private Double total;
    private String estadoPago; // PENDIENTE / PAGADA
}
