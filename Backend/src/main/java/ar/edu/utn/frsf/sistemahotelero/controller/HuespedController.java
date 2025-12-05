package ar.edu.utn.frsf.sistemahotelero.controller;

import ar.edu.utn.frsf.sistemahotelero.dto.HuespedResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.HuespedRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.HuespedSearchRequest;
import ar.edu.utn.frsf.sistemahotelero.service.GestorHuesped;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/huespedes")
public class HuespedController {

    @Autowired
    private GestorHuesped gestorHuesped;

 /*   // Endpoint para obtener todos los huespedes
    @GetMapping
    public ResponseEntity<List<HuespedResponse>> obtenerTodosLosHuespedes() {
        List<HuespedResponse> huespedes = gestorHuesped.obtenerTodosLosHuespedes();
        return ResponseEntity.ok(huespedes);
    }*/

    // Endpoint para dar de alta un nuevo huesped
    @PostMapping
    public ResponseEntity<HuespedResponse> darAltaHuesped(@Valid @RequestBody HuespedRequest huespedRequest) {
        HuespedResponse huespedResponse = gestorHuesped.darAltaHuesped(huespedRequest);
        return ResponseEntity.status(201).body(huespedResponse);  // Retornamos el nuevo huesped con un estado 201
    }
    
    //Endpoint para buscar un huesped
    @GetMapping("/busqueda")
    public ResponseEntity<List<HuespedResponse>> buscarHuespedes(
              @RequestParam(required = false) String apellido,
              @RequestParam(required = false) String nombre,
              @RequestParam(required = false) String nroDoc,
              @RequestParam(required = false) TipoDocumento tipoDoc) {

          // Crear un HuespedSearchRequest con los filtros proporcionados
          HuespedSearchRequest searchRequest = new HuespedSearchRequest();
          searchRequest.setApellido(apellido);
          searchRequest.setNombre(nombre);
          searchRequest.setNroDoc(nroDoc);
          searchRequest.setTipoDoc(tipoDoc);

          // Delegamos la búsqueda al servicio
          List<HuespedResponse> huespedesResponse = gestorHuesped.buscarPorCriterios(searchRequest);

          // Si no se encuentran resultados, devolvemos un 204 No Content
          if (huespedesResponse.isEmpty()) {
              return ResponseEntity.status(HttpStatus.NO_CONTENT).build();  
          }

          // Devolvemos los resultados con un 200 OK
          return ResponseEntity.ok(huespedesResponse);
      }
}    
