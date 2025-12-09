package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.service.EstadoHabitacionesService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDate;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/habitaciones")
public class EstadoHabitacionesController {

    @Autowired
    private EstadoHabitacionesService service;

  public EstadoHabitacionesController(EstadoHabitacionesService service) {
    this.service = service;
  }

  @GetMapping("/estado")
  public ResponseEntity<?> obtenerEstado(
      @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
  ) {
    if (desde.isAfter(hasta)) {
      return ResponseEntity.badRequest().body(
          "La fecha 'Desde' no puede ser mayor que 'Hasta'."
      );
    }
    return ResponseEntity.ok(service.obtener(desde, hasta));
  }
}
