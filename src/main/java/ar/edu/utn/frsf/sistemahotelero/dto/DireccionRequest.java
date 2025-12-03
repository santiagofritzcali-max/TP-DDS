package ar.edu.utn.frsf.sistemahotelero.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data  
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRequest {
    
    @NotBlank(message = "La calle es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La calle solo puede contener letras"
    )
    private String calle;
    
    @NotBlank(message = "El número es obligatorio")
    @Pattern(
        regexp = "^[0-9]+$",
        message = "El número solo puede contener números"
    )
    private String numero;
    
    
    private String departamento;
    
    @Pattern(
        regexp = "^[0-9]+$",
        message = "El piso solo puede contener números"
    )
    private String piso;
    
    @NotBlank(message = "El código postal es obligatorio")
    @Pattern(
        regexp = "^[0-9]+$",
        message = "El código postal solo puede contener números"
    )
    private String codigoPostal;
    
    @NotBlank(message = "La localidad es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La localidad solo puede contener letras"
    )
    private String localidad;
    
    @NotBlank(message = "La ciudad es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La ciudad solo puede contener letras"
    )
    private String ciudad;
    
    @NotBlank(message = "La provincia es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La provincia solo puede contener letras"
    )
    private String provincia;
    
    @NotBlank(message = "El país es obligatorio")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "El país solo puede contener letras"
    )
    private String pais;
}
