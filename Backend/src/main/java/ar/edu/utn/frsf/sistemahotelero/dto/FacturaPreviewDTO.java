// dto/facturacion/FacturaPreviewDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;

@Data
public class FacturaPreviewDTO {

    @Data
    public static class ResponsableDTO {
        private Long id;
        private String nombreOrazonSocial;
        private String cuit;
        private String posicionIVA;
        private String tipoFactura; // "A" o "B"
    }

    private ResponsableDTO responsable;
    private Long estadiaId;
    private Integer numeroHabitacion;
    private LocalDate fechaEgreso;
    private List<FacturaItemDTO> items;
    private Double subtotal;
    private Double iva;
    private Double total;
}
