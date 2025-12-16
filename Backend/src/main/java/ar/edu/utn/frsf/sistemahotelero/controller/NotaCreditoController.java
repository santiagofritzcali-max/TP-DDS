package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.FacturaNotaCreditoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.NotaCreditoGeneradaDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarNotaCreditoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.service.GestorNotaCredito;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/notas-credito")
public class NotaCreditoController {

    private final GestorNotaCredito gestorNotaCredito;

    @Autowired
    public NotaCreditoController(GestorNotaCredito gestorNotaCredito) {
        this.gestorNotaCredito = gestorNotaCredito;
    }

    @GetMapping("/pendientes")
    public List<FacturaNotaCreditoDTO> listarPendientes(
            @RequestParam(required = false) String cuit,
            @RequestParam(required = false) TipoDocumento tipoDoc,
            @RequestParam(required = false) String nroDoc) {
        return gestorNotaCredito.listarFacturasPendientes(cuit, tipoDoc, nroDoc);
    }

    @PostMapping
    public NotaCreditoGeneradaDTO generar(@RequestBody RegistrarNotaCreditoRequest request) {
        return gestorNotaCredito.generarNotaCredito(request);
    }
}
