package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direccion")
@Data  
@NoArgsConstructor
@AllArgsConstructor
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nroDoc;

    @Enumerated(EnumType.STRING) 
    private TipoDocumento tipoDoc;

    private String calle;
    private String numero;
    private String departamento;
    private String piso;
    private String codigoPostal;
    private String localidad;
    private String ciudad;
    private String provincia;
    private String pais;
    
    public Direccion(DireccionRequest request) {
    this.calle = request.getCalle();
    this.numero = request.getNumero();
    this.departamento = request.getDepartamento();
    this.piso = request.getPiso();
    this.codigoPostal = request.getCodigoPostal();
    this.localidad = request.getLocalidad();
    this.provincia = request.getProvincia();
    this.pais = request.getPais();
    this.ciudad = request.getCiudad();
    }

}
