package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.FacturaPendienteDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.PagoRegistradoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarPagoRequest;
import ar.edu.utn.frsf.sistemahotelero.service.GestorPago;
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
@RequestMapping("/api/pagos")
public class PagoController {

    private final GestorPago gestorPago;

    @Autowired
    public PagoController(GestorPago gestorPago) {
        this.gestorPago = gestorPago;
    }

    @GetMapping("/pendientes")
    public List<FacturaPendienteDTO> listarPendientes(@RequestParam Integer numeroHabitacion) {
        return gestorPago.listarFacturasPendientes(numeroHabitacion);
    }

    @PostMapping
    public PagoRegistradoDTO registrarPago(@RequestBody RegistrarPagoRequest request) {
        return gestorPago.registrarPago(request);
    }
}
