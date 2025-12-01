package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.model.Direccion;

import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
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
        // Convertir el HuespedRequest a la entidad Huesped
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
                // Convertir la dirección (asumimos que es un campo en HuespedRequest)
                new Direccion(huespedRequest.getDireccion())
        );

        // Guardar el nuevo huesped en la base de datos
        Huesped huespedGuardado = huespedDAO.save(huesped);

        // Convertir la entidad guardada en un HuespedResponse y devolverlo
        return new HuespedResponse(huespedGuardado);
    }

}
