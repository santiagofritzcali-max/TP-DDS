// ar.edu.utn.frsf.sistemahotelero.controller.ReservaController.java
package ar.edu.utn.frsf.sistemahotelero.controller;

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
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private GestorReserva gestorReserva;

    @PostMapping
    // Este método recibe un pedido de reserva en forma de ReservaRequest desde la UI
    public ResponseEntity<?> reservar(@RequestBody ReservaRequest request) {

        try {
            // Pasos 17, 18, 19 y 20, validaciones de formato y consistencia del controlador 
            validarReservaRequest(request);

            // Si llega aca, todo esta validado
            List<Reserva> reservas = gestorReserva.reservarHabitaciones(
                    request.getNumerosHabitacion(),
                    request.getFechaInicio(),
                    request.getFechaFin(),
                    request.getNombre().trim(),
                    request.getApellido().trim(),
                    request.getTelefono().trim()
            );

            List<ReservaResponse> respuesta = reservas.stream().map(ReservaMapper::toResponse).toList();

            return ResponseEntity.ok(respuesta);
        } 
        catch (IllegalArgumentException | IllegalStateException e) {
            // Errores de validación (del controller o del servicio)
            return ResponseEntity.badRequest().body(e.getMessage());
        } 
        catch (Exception e) {
            // Cualquier otro error inesperado 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocurrió un error inesperado al procesar la reserva.");
        }
    }

   //realizar validaciones de formato antes de pasar la request a gestor reserva
    private void validarReservaRequest(ReservaRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("El pedido de reserva no puede ser nulo.");
        }

        // Validar que haya habitaciones a reservar
        if (request.getNumerosHabitacion() == null || request.getNumerosHabitacion().isEmpty()) {
            throw new IllegalArgumentException("Se debe seleccionar al menos una habitación.");
        }

        // Ningún número de habitación vacío o nulo
        for (String nro : request.getNumerosHabitacion()) {
            if (nro == null || nro.isBlank()) {
                throw new IllegalArgumentException("Existe una habitación seleccionada con número vacío o nulo.");
            }
            
        }

        // Validación de fechas
        LocalDate inicio = request.getFechaInicio();
        LocalDate fin = request.getFechaFin();

        if (inicio == null || fin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin de la reserva son obligatorias.");
        }

        if (fin.isBefore(inicio)) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        // (opcional, pero muy razonable en reservas de hotel)
        LocalDate hoy = LocalDate.now();
        // Para validar que no se quiera hacer una reserva en el pasado
        if (fin.isBefore(hoy)) {
            throw new IllegalArgumentException("No se pueden realizar reservas completamente en el pasado.");
        }

        // Validación de nombre
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

        // Validación de apellido
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

        // Validación de teléfono
        String telefono = request.getTelefono();
        if (telefono == null || telefono.isBlank()) {
            throw new IllegalArgumentException("El teléfono es obligatorio.");
        }
        telefono = telefono.trim();
        if (telefono.length() < 6 || telefono.length() > 20) {
            throw new IllegalArgumentException("El teléfono debe tener entre 6 y 20 caracteres.");
        }
        // Permitimos dígitos, espacios, + y -
        if (!telefono.matches("^[0-9+\\-\\s]+$")) {
            throw new IllegalArgumentException("El teléfono solo puede contener dígitos, espacios, '+' o '-'.");
        }
    }
}