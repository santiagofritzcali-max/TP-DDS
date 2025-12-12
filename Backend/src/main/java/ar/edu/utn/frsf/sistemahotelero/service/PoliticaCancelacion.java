package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

public interface PoliticaCancelacion {

    /**
     Valida si una reserva puede ser cancelada,
     lanzando una excepción si no se cumple la regla.
     */
    
    void validarCancelacion(Reserva reserva);
}
