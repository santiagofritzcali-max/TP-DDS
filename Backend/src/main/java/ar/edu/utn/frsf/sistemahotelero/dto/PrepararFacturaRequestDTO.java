// dto/facturacion/PrepararFacturaRequestDTO.java
package ar.edu.utn.frsf.sistemahotelero.dto;

import lombok.Data;

@Data
public class PrepararFacturaRequestDTO {
    private Long estadiaId;
    private HuespedIdDTO huespedResponsable; // null si es tercero
    private String cuitTercero;              // null si es huesped
}

