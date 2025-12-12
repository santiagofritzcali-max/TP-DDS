package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import lombok.Data;

@Data
public class ResponsablePagoResponseDTO {
    private Long id;
    private String razonSocial;
    private String cuit;
    private PosicionIVA posicionIVA;
    private String telefono;
    private DireccionResponse direccion;
}

