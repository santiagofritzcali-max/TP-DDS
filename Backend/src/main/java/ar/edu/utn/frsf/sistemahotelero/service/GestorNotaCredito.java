package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.FacturaNotaCreditoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.NotaCreditoGeneradaDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarNotaCreditoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import java.util.List;

public interface GestorNotaCredito {

    List<FacturaNotaCreditoDTO> listarFacturasPendientes(String cuit, TipoDocumento tipoDoc, String nroDoc);

    NotaCreditoGeneradaDTO generarNotaCredito(RegistrarNotaCreditoRequest request);
}
