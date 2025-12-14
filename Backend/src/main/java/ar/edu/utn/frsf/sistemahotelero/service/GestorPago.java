package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.FacturaPendienteDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.PagoRegistradoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarPagoRequest;
import java.util.List;

public interface GestorPago {

    List<FacturaPendienteDTO> listarFacturasPendientes(Integer numeroHabitacion);

    PagoRegistradoDTO registrarPago(RegistrarPagoRequest request);
}
