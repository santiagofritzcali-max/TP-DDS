package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparResponse;
import ar.edu.utn.frsf.sistemahotelero.service.GestorReserva;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/estadias")
public class EstadiaController {

    @Autowired
    private GestorReserva gestorReserva;

    @PostMapping("/ocupar")
    public ResponseEntity<EstadiaOcuparResponse> ocuparHabitacion(
            @Valid @RequestBody EstadiaOcuparRequest request) {

        EstadiaOcuparResponse response = gestorReserva.ocuparHabitacion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

