// controller/FacturaController.java
package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.service.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/facturacion")
public class FacturaController {

    private final FacturaService facturaService;

    @Autowired
    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @GetMapping("/ocupantes")
    public BuscarOcupantesResponseDTO buscarOcupantes(
            @RequestParam Integer numeroHabitacion,
            @RequestParam String fechaEgreso) {

        LocalDate fecha = parseFechaEgreso(fechaEgreso);
        return facturaService.buscarOcupantes(numeroHabitacion, fecha);
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

    private LocalDate parseFechaEgreso(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String trimmed = raw.trim();

        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("d/M/yyyy")
        };

        for (DateTimeFormatter f : formatters) {
            try {
                return LocalDate.parse(trimmed, f);
            } catch (DateTimeParseException ignored) {
                // probamos el siguiente formato
            }
        }
        return null;
    }
}
