package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.ReservaHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaMapper;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaResponse;
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

    @PostMapping
    public ResponseEntity<?> reservar(@RequestBody ReservaRequest request) {

        try {
            // Validaciones de formato y consistencia
            validarReservaRequest(request);

            // Si llega acá, todo está validado
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
            // Errores de validación (del controller o del servicio)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e) {
            // Cualquier otro error inesperado
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocurrió un error inesperado al procesar la reserva.");
        }
    }

    // ====================================================================
    // Validación de la request
    // ====================================================================
    private void validarReservaRequest(ReservaRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("El pedido de reserva no puede ser nulo.");
        }

        // ---- Validar lista de reservas por habitación ----
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

            // (Opcional, pero razonable)
            if (fin.isBefore(hoy)) {
                throw new IllegalArgumentException(
                        "No se pueden realizar reservas completamente en el pasado para la habitación " + nro + ".");
            }
        }

        // ---- Validación de nombre ----
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

        // ---- Validación de apellido ----
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

        // ---- Validación de teléfono ----
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
