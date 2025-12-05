package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data  
@NoArgsConstructor  
@AllArgsConstructor 
public class HuespedResponse {

    @Size(max = 100)
    private String apellido;

    @Size(max = 100)
    private String nombre;

    private TipoDocumento tipoDoc;
    
    @Size(max = 20)
    private String nroDoc;

    private LocalDate fechaNacimiento;

    @Size(max = 20)
    private String telefono;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String ocupacion;

    @Size(max = 100)
    private String nacionalidad;

    @Size(max = 20)
    private String cuit;

    private PosicionIVA posicionIVA;

    private DireccionResponse direccion;
   
    
     // Constructor que acepta la entidad Huesped
    public HuespedResponse(Huesped huesped) {
        this.nroDoc = huesped.getNroDoc();
        this.tipoDoc = huesped.getTipoDoc();
        this.apellido = huesped.getApellido();
        this.nombre = huesped.getNombre();
        this.fechaNacimiento = huesped.getFechaNacimiento();
        this.telefono = huesped.getTelefono();
        this.email = huesped.getEmail();
        this.ocupacion = huesped.getOcupacion();
        this.nacionalidad = huesped.getNacionalidad();
        this.cuit = huesped.getCuit();
        this.posicionIVA = huesped.getPosicionIVA();
        this.direccion = new DireccionResponse(huesped.getDireccion());  // Suponiendo que DireccionResponse tiene el constructor correspondiente
    }
    

}
