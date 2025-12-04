package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.validaciones.ValidCuit;
import ar.edu.utn.frsf.sistemahotelero.validaciones.ValidEmail;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data  
@NoArgsConstructor  
@AllArgsConstructor 
public class HuespedRequest {

    @Size(max = 100)
    @NotBlank(message = "El apellido es obligatorio")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$", 
         message = "El apellido solo puede contener letras")
    private String apellido;

    @Size(max = 100)
    @NotBlank(message = "El nombre es obligatorio")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$", 
         message = "El nombre solo puede contener letras")
    private String nombre;

    private TipoDocumento tipoDoc;
    
    @Size(max = 20)
    @NotBlank(message = "El número de documento es obligatorio")
    @Pattern(
        regexp = "^[0-9]+$",
        message = "El número de documento debe contener solo números"
    )
    private String nroDoc;
    
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @Size(max = 20)
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
        regexp = "^[0-9]+$",
        message = "El teléfono debe contener solo numeros"
    )
    private String telefono;

    @Size(max = 100)
    @ValidEmail(message = "El email no tiene un formato válido")
    private String email;

    @Size(max = 100)
    @NotBlank(message = "La ocupación es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La ocupación solo puede contener letras"
    )
    private String ocupacion;

    @Size(max = 100)
    @NotBlank(message = "La nacionalidad es obligatoria")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$",
        message = "La nacionalidad solo puede contener letras"
    )
    private String nacionalidad;

    @ValidCuit(message = "El CUIT debe tener el formato XX-XXXXXXXX-X")
    private String cuit;

    @NotNull(message = "La posición frente al IVA es obligatoria")
    private PosicionIVA posicionIVA;
    
    @Valid
    private DireccionRequest direccion; 
    
    private Boolean aceptarDuplicado;
    
}

