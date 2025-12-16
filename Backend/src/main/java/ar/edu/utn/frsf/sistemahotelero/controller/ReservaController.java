package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.CancelarReservaItemDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.CancelarReservasRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaMapper;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaResponse;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.service.GestorReserva;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private GestorReserva gestorReserva;

    // CU04 - Reservar
    @PostMapping
    public ResponseEntity<?> reservar(@RequestBody ReservaRequest request) {
        try {
            List<Reserva> reservas = gestorReserva.reservarHabitaciones(
                    request.getReservas(),
                    request.getNombre(),
                    request.getApellido(),
                    request.getTelefono()
            );

            List<ReservaResponse> respuesta = reservas.stream()
                    .map(ReservaMapper::toResponse)
                    .toList();

            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al procesar la reserva.");
        }
    }

    // CU06 - Buscar reservas para la grilla
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarReservas(@RequestParam(name = "apellido") String apellido,
                                            @RequestParam(name = "nombre", required = false) String nombre) {
        try {
            if (apellido == null || apellido.isBlank()) {
                return ResponseEntity.badRequest().body("El campo apellido no puede estar vacío.");
            }

            List<Reserva> reservas = gestorReserva.buscarReservas(
                    apellido.trim(),
                    (nombre == null || nombre.isBlank()) ? null : nombre.trim()
            );

            List<CancelarReservaItemDTO> respuesta = reservas.stream()
                    .map(ReservaMapper::toCancelarItem)
                    .toList();

            if (reservas.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No existen reservas para los criterios de búsqueda");
            }
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al buscar reservas.");
        }
    }

    // CU06 - Cancelar reservas seleccionadas
    @PostMapping("/cancelar")
    public ResponseEntity<?> cancelarReservas(@RequestBody CancelarReservasRequest request) {
        try {
            if (request == null || request.getIdsReservas() == null || request.getIdsReservas().isEmpty()) {
                return ResponseEntity.badRequest().body("Debe seleccionar al menos una reserva a cancelar.");
            }

            gestorReserva.cancelarReservas(request.getIdsReservas());
            return ResponseEntity.ok("Reservas canceladas correctamente.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al cancelar las reservas.");
        }
    }
}
