package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.service.GestorReserva;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private GestorReserva gestorReserva;

    // CU04 - Reservar (ya estaba)
    @PostMapping
    public ResponseEntity<?> reservar(@RequestBody ReservaRequest request) {

        try {
            validarReservaRequest(request);

            List<Reserva> reservas = gestorReserva.reservarHabitaciones(
                    request.getReservas(),
                    request.getNombre().trim(),
                    request.getApellido().trim(),
                    request.getTelefono().trim()
            );

            List<ReservaResponse> respuesta = reservas.stream()
                    .map(ReservaMapper::toResponse)
                    .toList();

            return ResponseEntity.ok(respuesta);
        }
        catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al procesar la reserva.");
        }
    }


    // CU06 - Buscar reservas para la grilla
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarReservas(@RequestParam(name = "apellido") String apellido, 
            @RequestParam(name = "nombre", required = false) String nombre) {
        try {
            
            //Valido que el apellido no este vacio
            if (apellido == null || apellido.isBlank()) return ResponseEntity.badRequest().body("El campo apellido no puede estar vacío.");

            //Busco las reservas
            List<Reserva> reservas = gestorReserva.buscarReservas(apellido.trim(), (nombre == null || nombre.isBlank()) ? null : nombre.trim());

            List<CancelarReservaItemDTO> respuesta = reservas.stream().map(ReservaMapper::toCancelarItem).toList();

            //Flujo alternativo 4.A
            if (reservas.isEmpty())return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existen reservas para los criterios de búsqueda");
            return ResponseEntity.ok(respuesta);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al buscar reservas.");
        }
    }

    // CU06 - Cancelar reservas seleccionadas en la grilla
    @PostMapping("/cancelar")
    public ResponseEntity<?> cancelarReservas(@RequestBody CancelarReservasRequest request) {
        try {
            if (request == null || request.getIdsReservas() == null || request.getIdsReservas().isEmpty()) {
                return ResponseEntity.badRequest().body("Debe seleccionar al menos una reserva a cancelar.");
            }

            gestorReserva.cancelarReservas(request.getIdsReservas());

            return ResponseEntity.ok("Reservas canceladas correctamente.");
        }
        catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al cancelar las reservas.");
        }
    }


    // CU04 - Validación de la request  

    private void validarReservaRequest(ReservaRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("El pedido de reserva no puede ser nulo.");
        }

        if (request.getReservas() == null || request.getReservas().isEmpty()) {
            throw new IllegalArgumentException("Se debe seleccionar al menos una habitación.");
        }

        LocalDate hoy = LocalDate.now();

        for (ReservaHabitacionRequest rReq : request.getReservas()) {

            if (rReq == null) {
                throw new IllegalArgumentException("Existe una reserva nula en el pedido.");
            }

            String nro = rReq.getNumeroHabitacion();
            if (nro == null || nro.isBlank()) {
                throw new IllegalArgumentException(
                        "Existe una habitación seleccionada con número vacío o nulo.");
            }

            LocalDate inicio = rReq.getFechaInicio();
            LocalDate fin = rReq.getFechaFin();

            if (inicio == null || fin == null) {
                throw new IllegalArgumentException(
                        "Las fechas de inicio y fin de cada reserva de habitación son obligatorias.");
            }

            if (fin.isBefore(inicio)) {
                throw new IllegalArgumentException(
                        "La fecha de fin no puede ser anterior a la fecha de inicio para la habitación " + nro + ".");
            }

            if (fin.isBefore(hoy)) {
                throw new IllegalArgumentException(
                        "No se pueden realizar reservas completamente en el pasado para la habitación " + nro + ".");
            }
        }

        String nombre = request.getNombre();
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }
        nombre = nombre.trim();
        if (nombre.length() > 50) {
            throw new IllegalArgumentException("El nombre es demasiado largo (máximo 50 caracteres).");
        }
        if (!nombre.matches("^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+$")) {
            throw new IllegalArgumentException("El nombre solo puede contener letras y espacios.");
        }

        String apellido = request.getApellido();
        if (apellido == null || apellido.isBlank()) {
            throw new IllegalArgumentException("El apellido es obligatorio.");
        }
        apellido = apellido.trim();
        if (apellido.length() > 50) {
            throw new IllegalArgumentException("El apellido es demasiado largo (máximo 50 caracteres).");
        }
        if (!apellido.matches("^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+$")) {
            throw new IllegalArgumentException("El apellido solo puede contener letras y espacios.");
        }

        String telefono = request.getTelefono();
        if (telefono == null || telefono.isBlank()) {
            throw new IllegalArgumentException("El teléfono es obligatorio.");
        }
        telefono = telefono.trim();
        if (telefono.length() < 6 || telefono.length() > 20) {
            throw new IllegalArgumentException("El teléfono debe tener entre 6 y 20 caracteres.");
        }
        if (!telefono.matches("^[0-9+\\-\\s]+$")) {
            throw new IllegalArgumentException(
                    "El teléfono solo puede contener dígitos, espacios, '+' o '-'.");
        }
    }
}
