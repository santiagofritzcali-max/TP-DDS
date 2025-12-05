package ar.edu.utn.frsf.sistemahotelero.service;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
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
    public List<Habitacion> buscarPorEstado(EstadoHabitacion estado){
        
        if(estado == null) throw new IllegalArgumentException("El estado de la habitación es obligatorio para realizar la búsqueda.");
        return habitacionDAO.findByEstado(estado);
    }

    @Override
    public void actualizarEstado(String numeroHabitacion, EstadoHabitacion nuevoEstado) {
        Habitacion habitacion = habitacionDAO.findByNumero(numeroHabitacion).orElseThrow(() -> new IllegalArgumentException("No existe la habitación número " + numeroHabitacion));

        habitacion.setEstado(nuevoEstado);
        habitacionDAO.save(habitacion);
    }

    @Override
    //paso 7, e valida el estado
    public boolean validarDisponibilidad(Habitacion habitacion, LocalDate inicio, LocalDate fin) {

        //validaciones
        if (habitacion == null) throw new IllegalArgumentException("La habitación a validar no puede ser nula.");
        if (inicio == null || fin == null) throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias para validar disponibilidad.");
        if (fin.isBefore(inicio)) throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio al validar disponibilidad.");

        //Si llega hasta aca, tanto la habitacion como las fechas son cherentes
        List<Reserva> solapadas = 
                reservaDAO.buscarPorHabitacionYRangoFechas(habitacion, inicio, fin);

        // Si la lista está vacía la habitacion esta disponible porqueno hay solapamientos 
        return solapadas.isEmpty(); //paso 8.1, envia la validacion
    }
}
