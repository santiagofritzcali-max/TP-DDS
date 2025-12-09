package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GestorReservaImpl implements GestorReserva {

    @Autowired
    private ReservaDAO reservaDAO;

    @Autowired
    private EstadiaDAO estadiaDAO;

    @Override
    public List<Reserva> obtenerReservasEnRango(LocalDate desde, LocalDate hasta) {
        return reservaDAO.findReservasEnRango(desde, hasta);
    }

    @Override
    public List<Estadia> obtenerEstadiasEnRango(LocalDate desde, LocalDate hasta) {
        return estadiaDAO.findEstadiasEnRango(desde, hasta);
    }

    // resto de operaciones de reservas / estadías según tu diseño...
}
