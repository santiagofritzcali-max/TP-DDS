package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoRequestDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoResponseDTO;
import ar.edu.utn.frsf.sistemahotelero.service.ResponsableDePagoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/responsables")
@RequiredArgsConstructor
public class ResponsableDePagoController {

    private final ResponsableDePagoService service;

    @GetMapping
    public ResponseEntity<List<ResponsablePagoResponseDTO>> buscar(
            @RequestParam(required = false) String razonSocial,
            @RequestParam(required = false) String cuit) {
        List<ResponsablePagoResponseDTO> resultado = service.buscar(razonSocial, cuit);
        if (resultado.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    public ResponsablePagoResponseDTO obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<ResponsablePagoResponseDTO> crear(
            @Valid @RequestBody ResponsablePagoRequestDTO request) {
        ResponsablePagoResponseDTO creado = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponsablePagoResponseDTO actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ResponsablePagoRequestDTO request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
