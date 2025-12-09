package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;

import java.time.LocalDate;
import java.util.List;

public interface GestorReserva {

    List<Reserva> obtenerReservasEnRango(LocalDate desde, LocalDate hasta);

    List<Estadia> obtenerEstadiasEnRango(LocalDate desde, LocalDate hasta);

    // acá podrás tener otros métodos (crearReserva, cancelarReserva, crearEstadia, etc.)
}
