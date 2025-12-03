package ar.edu.utn.frsf.sistemahotelero.dto;

import lombok.*;

@Data  
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRequest {

    private String calle;
    private String numero;
    private String departamento;
    private String piso;
    private String codigoPostal;
    private String localidad;
    private String ciudad;
    private String provincia;
    private String pais;
}
