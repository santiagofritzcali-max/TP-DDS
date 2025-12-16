// service/FacturaService.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.*;

import java.time.LocalDate;

public interface GestorFactura {

    BuscarOcupantesResponseDTO buscarOcupantes(
            Integer numeroHabitacion,
            LocalDate fechaEgreso);

    FacturaPreviewDTO prepararFactura(PrepararFacturaRequestDTO request);

    FacturaGeneradaDTO generarFactura(CrearFacturaRequestDTO request);
}
