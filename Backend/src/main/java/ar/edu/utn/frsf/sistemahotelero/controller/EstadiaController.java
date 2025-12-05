package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionResponse;
import ar.edu.utn.frsf.sistemahotelero.service.GestorReserva;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estadias")
public class EstadiaController {

    @Autowired
    private GestorReserva gestorReserva;

    @PostMapping("/ocupar")
    public ResponseEntity<OcuparHabitacionResponse> ocuparHabitacion(
            @Valid @RequestBody OcuparHabitacionRequest request) {

        OcuparHabitacionResponse response = gestorReserva.ocuparHabitacion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

