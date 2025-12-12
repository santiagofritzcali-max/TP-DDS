package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.validaciones.ValidCuit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResponsablePagoRequestDTO {

    @NotBlank(message = "La razon social es obligatoria")
    private String razonSocial;

    @NotBlank(message = "El CUIT es obligatorio")
    @ValidCuit
    private String cuit;

    @NotNull(message = "La posicion IVA es obligatoria")
    private PosicionIVA posicionIVA;

    @NotBlank(message = "El telefono es obligatorio")
    private String telefono;

    @Valid
    @NotNull(message = "La direccion es obligatoria")
    private DireccionRequest direccion;
}

