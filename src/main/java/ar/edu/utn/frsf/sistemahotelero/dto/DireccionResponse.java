package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.persistence.*;
import lombok.*;

@Data  
@NoArgsConstructor
@AllArgsConstructor
public class DireccionResponse {

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
    private String provincia;
    private String pais;
}
