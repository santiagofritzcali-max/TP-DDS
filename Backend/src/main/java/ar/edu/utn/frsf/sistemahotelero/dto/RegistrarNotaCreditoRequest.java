package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import java.util.List;
import lombok.Data;

@Data
public class RegistrarNotaCreditoRequest {
    private String cuit;
    private TipoDocumento tipoDoc;
    private String nroDoc;
    private List<Long> facturaIds;
}
