package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class FacturaNotaCreditoDTO {
    private Long facturaId;
    private Integer numeroFactura;
    private LocalDate fechaEmision;
    private String tipoFactura;
    private BigDecimal neto;
    private BigDecimal iva;
    private BigDecimal total;
}
