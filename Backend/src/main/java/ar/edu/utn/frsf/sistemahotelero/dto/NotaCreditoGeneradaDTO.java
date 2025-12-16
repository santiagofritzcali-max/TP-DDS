package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class NotaCreditoGeneradaDTO {
    private Long notaCreditoId;
    private Integer numeroNotaCredito;
    private LocalDate fecha;
    private String responsable;
    private BigDecimal neto;
    private BigDecimal iva;
    private BigDecimal total;
    private List<FacturaNotaCreditoDTO> facturas;
}
