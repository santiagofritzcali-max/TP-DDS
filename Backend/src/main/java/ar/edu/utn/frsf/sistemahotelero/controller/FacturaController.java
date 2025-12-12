// controller/FacturaController.java
package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.service.*;

import java.time.LocalDate;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/facturacion")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @GetMapping("/ocupantes")
    public BuscarOcupantesResponseDTO buscarOcupantes(
            @RequestParam Integer numeroHabitacion,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaEgreso) {

        return facturaService.buscarOcupantes(numeroHabitacion, fechaEgreso);
    }

    @PostMapping("/previsualizacion")
    public FacturaPreviewDTO prepararFactura(
            @RequestBody PrepararFacturaRequestDTO request) {
        return facturaService.prepararFactura(request);
    }

    @PostMapping
    public FacturaGeneradaDTO generarFactura(
            @RequestBody CrearFacturaRequestDTO request) {
        return facturaService.generarFactura(request);
    }
}
