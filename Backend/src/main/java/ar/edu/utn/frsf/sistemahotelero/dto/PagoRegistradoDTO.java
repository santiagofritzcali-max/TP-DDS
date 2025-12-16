package ar.edu.utn.frsf.sistemahotelero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoRegistradoDTO {
    private Long pagoId;
    private Long facturaId;
    private Integer numeroFactura;
    private LocalDate fechaPago;
    private BigDecimal totalFactura;
    private BigDecimal montoPagado;
    private BigDecimal vuelto;
    private String estadoFactura;
    private Integer numeroHabitacion;
}
