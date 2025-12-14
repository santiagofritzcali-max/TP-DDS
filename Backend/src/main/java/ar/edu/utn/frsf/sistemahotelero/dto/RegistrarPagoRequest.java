package ar.edu.utn.frsf.sistemahotelero.dto;

import java.util.List;
import lombok.Data;

@Data
public class RegistrarPagoRequest {
    private Long facturaId;
    private List<MedioPagoRequest> medios;
}
