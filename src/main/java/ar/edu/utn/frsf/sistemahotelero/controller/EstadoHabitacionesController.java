import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/habitaciones")
public class EstadoHabitacionesController {

  private final EstadoHabitacionesService service;

  public EstadoHabitacionesController(EstadoHabitacionesService service) {
    this.service = service;
  }

  @GetMapping("/estado")
  public ResponseEntity<?> obtenerEstado(
      @RequestParam @NotNull @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate desde,
      @RequestParam @NotNull @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate hasta
  ) {
    if (desde.isAfter(hasta)) {
      return ResponseEntity.badRequest().body(
          "La fecha 'Desde' no puede ser mayor que 'Hasta'."
      );
    }
    return ResponseEntity.ok(service.obtener(desde, hasta));
  }
}
