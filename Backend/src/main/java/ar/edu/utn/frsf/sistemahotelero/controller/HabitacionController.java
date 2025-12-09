package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesResponse;
import ar.edu.utn.frsf.sistemahotelero.service.GestorHabitacion;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "http://localhost:3000") // ajustá origen si hace falta
public class HabitacionController {

    @Autowired
    private GestorHabitacion gestorHabitacion;

    @GetMapping("/estado")
    public ResponseEntity<EstadoHabitacionesResponse> obtenerEstadoHabitaciones(
            @RequestParam("desde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam("hasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        EstadoHabitacionesRequest request = new EstadoHabitacionesRequest();
        request.setDesde(desde);
        request.setHasta(hasta);

        EstadoHabitacionesResponse response = gestorHabitacion.obtenerEstadoHabitaciones(request);

        return ResponseEntity.ok(response);
    }
}
