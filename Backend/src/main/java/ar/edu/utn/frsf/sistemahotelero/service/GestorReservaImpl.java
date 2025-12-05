// ar.edu.utn.frsf.sistemahotelero.service.GestorReservaImpl.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.OcuparHabitacionResponse;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
public class GestorReservaImpl implements GestorReserva {

    @Autowired
    private ReservaDAO reservaDAO;

    @Autowired
    private HabitacionDAO habitacionDAO;

    @Autowired
    private EstadiaDAO estadiaDAO;

    @Autowired
    private GestorHabitacion gestorHabitacion;

    // CU04 - Reservar habitaciones
    @Override
    @Transactional
    public List<Reserva> reservarHabitaciones(List<String> numerosHabitacion,
                                              LocalDate fechaInicio,
                                              LocalDate fechaFin,
                                              String nombre,
                                              String apellido,
                                              String telefono) {

        List<Reserva> reservasCreadas = new ArrayList<>();

        // para evitar repetir el mismo nro de habitación
        Set<String> habitacionesProcesadas = new HashSet<>();

        for (String nro : numerosHabitacion) {

            // si ya procesamos ese número, lo salteamos
            if (!habitacionesProcesadas.add(nro)) continue;

            Habitacion habitacion = habitacionDAO.findByNumero(nro).orElseThrow(() -> new IllegalArgumentException("No existe la habitación número " + nro));

            //paso 6.1, se envia llama al gestor habitacion para ver que los rangos sean validos
            if (!gestorHabitacion.validarDisponibilidad(habitacion, fechaInicio, fechaFin)){
                throw new IllegalStateException("La habitación " + nro + " no está disponible."); //paso 9, error al seleccionar
            }

            //paso 21, solicitud de creacion de reserva 
            Reserva r = new Reserva(); //paso 22, creo la reserva
           
            //pasos 23 a 29
            r.setHabitacion(habitacion);
            r.setFechaInicio(fechaInicio);
            r.setFechaFin(fechaFin);
            r.setFechaReserva(LocalDate.now());
            r.setNombre(nombre);
            r.setApellido(apellido);
            r.setTelefono(telefono);

            Reserva guardada = reservaDAO.save(r);
            reservasCreadas.add(guardada);

            //Se tiene que eliminar de la lista de disponibles, que se obtiene del CU del lauti
            // actualizar estado de la habitación a RESERVADA
            gestorHabitacion.actualizarEstado(nro, EstadoHabitacion.Reservada);
        }

        return reservasCreadas;
    }

    // helper para pasar de java.util.Date a LocalDate
    private LocalDate convertToLocalDate(Date date) {
        return date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
    }


    // CU15 - Ocupar habitación
    @Override
    @Transactional
    public OcuparHabitacionResponse ocuparHabitacion(OcuparHabitacionRequest request) {

        String nroHab;
        try {
            nroHab = String.valueOf(request.getNumeroHabitacion());
        } catch (NumberFormatException ex) {
            throw new ReglaNegocioException("Número de habitación inválido");
        }

        Habitacion habitacion = habitacionDAO.findByNumero(nroHab)
                .orElseThrow(() -> new ReglaNegocioException(
                        "No existe la habitación " + nroHab));

        LocalDate desde = request.getFechaIngreso();
        LocalDate hasta = request.getFechaEgreso();

        // 1) Verificar solapamiento de estadías
        List<Estadia> solapadas =
                estadiaDAO.buscarPorHabitacionYRangoFechas(habitacion, desde, hasta);

        if (!solapadas.isEmpty()) {
            throw new ReglaNegocioException(
                    "La habitación " + nroHab + " ya tiene estadías en ese rango de fechas");
        }

        // 2) Verificar reservas en ese rango
        List<Reserva> reservas =
                reservaDAO.buscarPorHabitacionYRangoFechas(habitacion, desde, hasta);

        if (!reservas.isEmpty() && !request.isOcuparIgualSiReservada()) {
            throw new ReglaNegocioException(
                    "La habitación " + nroHab + " se encuentra reservada en ese rango de fechas");
        }

        // Tomamos una reserva (la primera) si existe
        Reserva reservaAsociada = reservas.isEmpty() ? null : reservas.get(0);

        // 3) Crear la entidad Estadia
        Estadia estadia = new Estadia();
        estadia.setFechaIngreso(desde);
        estadia.setFechaEgreso(hasta);
        estadia.setHabitacion(habitacion);

        if (reservaAsociada != null) {
            estadia.setReserva(reservaAsociada);
        }

        // 4) Actualizar estado de la habitación a OCUPADA
        habitacion.setEstado(EstadoHabitacion.Ocupada);
        habitacionDAO.save(habitacion);

        // 5) Guardar estadía
        Estadia guardada = estadiaDAO.save(estadia);

        return new OcuparHabitacionResponse(
                guardada.getId(),
                habitacion.getNumero(),
                guardada.getFechaIngreso(),
                guardada.getFechaEgreso(),
                "Habitación " + habitacion.getNumero() + " ocupada correctamente."
        );
    }
}
