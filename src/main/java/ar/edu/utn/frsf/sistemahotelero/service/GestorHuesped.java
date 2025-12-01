package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.*;

import java.util.List;

public interface GestorHuesped {

    // Método para obtener todos los huespedes
    List<HuespedResponse> obtenerTodosLosHuespedes();

    // Método para buscar huespedes por los criterios de búsqueda
    List<HuespedResponse> buscarPorCriterios(String apellido, String nombre, String nroDoc, String tipoDoc);
    
    // Método para dar de alta un nuevo huesped
    HuespedResponse darAltaHuesped(HuespedRequest huespedRequest);
}
