package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.validaciones.ValidPiso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRequest {

    @NotBlank(message = "La calle es obligatoria")
    @Pattern(regexp = "^[A-Za-z0-9 .-]+$", message = "La calle solo puede contener letras, numeros, espacio o .-")
    private String calle;

    @NotBlank(message = "El numero es obligatorio")
    @Pattern(regexp = "^[0-9]+$", message = "El numero solo puede contener numeros")
    private String numero;

    private String departamento;

    @ValidPiso
    private String piso;

    @NotBlank(message = "El codigo postal es obligatorio")
    @Pattern(regexp = "^[0-9]+$", message = "El codigo postal solo puede contener numeros")
    private String codigoPostal;

    @NotBlank(message = "La localidad es obligatoria")
    @Pattern(regexp = "^[A-Za-z .-]+$", message = "La localidad solo puede contener letras, espacio o .-")
    private String localidad;

    @NotBlank(message = "La ciudad es obligatoria")
    @Pattern(regexp = "^[A-Za-z .-]+$", message = "La ciudad solo puede contener letras, espacio o .-")
    private String ciudad;

    @NotBlank(message = "La provincia es obligatoria")
    @Pattern(regexp = "^[A-Za-z .-]+$", message = "La provincia solo puede contener letras, espacio o .-")
    private String provincia;

    @NotBlank(message = "El pais es obligatorio")
    @Pattern(regexp = "^[A-Za-z .-]+$", message = "El pais solo puede contener letras, espacio o .-")
    private String pais;
}
