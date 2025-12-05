package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import lombok.Data;

@Data
public class HuespedSearchRequest {

    private String apellido;
    private String nombre;
    private String nroDoc;
    private TipoDocumento tipoDoc;
}
