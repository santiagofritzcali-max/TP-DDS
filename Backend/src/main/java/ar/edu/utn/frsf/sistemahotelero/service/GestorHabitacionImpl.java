package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class GestorHabitacionImpl implements GestorHabitacion {

    @Autowired
    private HabitacionDAO habitacionDAO;

    @Autowired
    private ReservaDAO reservaDAO;

    @Override
    public List<Habitacion> buscarPorEstado(EstadoHabitacion estado) {
        if (estado == null) throw new IllegalArgumentException("El estado es obligatorio.");
        return habitacionDAO.findByEstado(estado);
    }

    @Override
    public void actualizarEstado(HabitacionId id, EstadoHabitacion nuevoEstado) {
        if (id == null) throw new IllegalArgumentException("El id (piso+habitación) es obligatorio.");
        if (nuevoEstado == null) throw new IllegalArgumentException("El nuevo estado es obligatorio.");

        Habitacion habitacion = habitacionDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe la habitación " + id));

        habitacion.setEstado(nuevoEstado);
        habitacionDAO.save(habitacion);
    }

    @Override
    public boolean validarDisponibilidad(Habitacion habitacion, LocalDate inicio, LocalDate fin) {
        if (habitacion == null) throw new IllegalArgumentException("Habitación nula.");
        if (inicio == null || fin == null) throw new IllegalArgumentException("Fechas obligatorias.");
        if (fin.isBefore(inicio)) throw new IllegalArgumentException("Fin < inicio.");

        List<Reserva> solapadas = reservaDAO.buscarPorHabitacionYRangoFechas(habitacion, inicio, fin);
        return solapadas.isEmpty();
    }
}
