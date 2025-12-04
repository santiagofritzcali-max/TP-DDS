package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.excepciones.HuespedDuplicadoException;
import ar.edu.utn.frsf.sistemahotelero.model.Direccion;

import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GestorHuespedImpl implements GestorHuesped {

    @Autowired
    private HuespedDAO huespedDAO;

    // Obtener todos los huespedes
    @Override
    public List<HuespedResponse> obtenerTodosLosHuespedes() {
        List<Huesped> huespedes = (List<Huesped>) huespedDAO.findAll();  // Llama al método CRUD para obtener todos los huespedes
        return huespedes.stream()
                .map(this::convertirAHuespedResponse)  // Convierte las entidades a DTOs
                .collect(Collectors.toList());
    }

    // Buscar huespedes por los criterios
    @Override
    public List<HuespedResponse> buscarPorCriterios(String apellido, String nombre, String nroDoc, String tipoDoc) {
        List<Huesped> huespedes = huespedDAO.buscarPorCriterios(apellido, nombre, nroDoc, tipoDoc);  // Llama al método personalizado del DAO
        return huespedes.stream()
                .map(this::convertirAHuespedResponse)  // Convierte las entidades a DTOs
                .collect(Collectors.toList());
    }

    // Método auxiliar para convertir la entidad Huesped a DTO
    private HuespedResponse convertirAHuespedResponse(Huesped huesped) {
        return new HuespedResponse(
                huesped.getApellido(),
                huesped.getNombre(),
                huesped.getTipoDoc(),
                huesped.getNroDoc(),
                huesped.getFechaNacimiento(),
                huesped.getTelefono(),
                huesped.getEmail(),
                huesped.getOcupacion(),
                huesped.getNacionalidad(),
                huesped.getCuit(),
                huesped.getPosicionIVA(),
                // Suponiendo que DireccionResponse tiene un constructor que acepta la entidad Direccion
                new DireccionResponse(huesped.getDireccion())
        );
    }

 @Override
 public HuespedResponse darAltaHuesped(HuespedRequest huespedRequest) {

    // 1) Construir la PK compuesta
    HuespedId id = new HuespedId(
            huespedRequest.getNroDoc(),
            huespedRequest.getTipoDoc()
    );

    boolean yaExiste = huespedDAO.existsById(id);

    // 2) Si ya existe y NO se autorizó a sobrescribir, lanzo excepción 409
    if (yaExiste && (huespedRequest.getAceptarDuplicado() == null
            || !huespedRequest.getAceptarDuplicado())) {
        throw new HuespedDuplicadoException(
                huespedRequest.getTipoDoc(),
                huespedRequest.getNroDoc()
        );
    }

    // 3) Mapear DTO -> entidad (nuevo estado del huésped)
    Huesped huesped = new Huesped(
            huespedRequest.getNroDoc(),
            huespedRequest.getTipoDoc(),
            huespedRequest.getApellido(),
            huespedRequest.getNombre(),
            huespedRequest.getFechaNacimiento(),
            huespedRequest.getTelefono(),
            huespedRequest.getEmail(),
            huespedRequest.getOcupacion(),
            huespedRequest.getNacionalidad(),
            huespedRequest.getCuit(),
            huespedRequest.getPosicionIVA(),
            new Direccion(huespedRequest.getDireccion())
    );

    // 4) Guardar
    
    Huesped huespedGuardado = huespedDAO.save(huesped);

    return new HuespedResponse(huespedGuardado);
 }
}
