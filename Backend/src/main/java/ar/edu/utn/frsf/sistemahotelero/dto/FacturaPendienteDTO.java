package ar.edu.utn.frsf.sistemahotelero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class FacturaPendienteDTO {
    private Long facturaId;
    private Integer numeroFactura;
    private LocalDate fechaEmision;
    private BigDecimal total;
    private String tipoFactura;
    private String estadoPago;
    private String responsable;
    private Integer numeroHabitacion;
}
