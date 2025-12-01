package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data  
@NoArgsConstructor  
@AllArgsConstructor 
public class HuespedResponse {

    @Size(max = 50)
    private String apellido;

    @Size(max = 50)
    private String nombre;

    private TipoDocumento tipoDoc;
    
    @Size(max = 20)
    private String nroDoc;

    private LocalDate fechaNacimiento;

    @Size(max = 20)
    private String telefono;

    @Email
    @Size(max = 50)
    private String email;

    @Size(max = 100)
    private String ocupacion;

    @Size(max = 50)
    private String nacionalidad;

    @Size(max = 20)
    private String cuit;

    private PosicionIVA posicionIVA;

    private DireccionResponse direccion;  

}
