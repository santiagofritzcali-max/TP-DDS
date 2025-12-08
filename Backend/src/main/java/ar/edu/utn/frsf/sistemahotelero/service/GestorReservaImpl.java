// ar.edu.utn.frsf.sistemahotelero.service.GestorReservaImpl.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;

import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.HuespedIdDTO;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;

import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;

import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

import ar.edu.utn.frsf.sistemahotelero.util.HabitacionKeyUtil;


@Service
public class GestorReservaImpl implements GestorReserva {
    
    @Autowired
    private HuespedDAO huespedDAO;
    
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

            HabitacionId id = HabitacionKeyUtil.parse(nro);
            Habitacion habitacion = habitacionDAO.findById(id).orElseThrow(() -> new IllegalArgumentException("No existe la habitación " + nro));


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

@Override
@Transactional
    public EstadiaOcuparResponse ocuparHabitacion(EstadiaOcuparRequest request) {

        Integer nroPiso = request.getNroPiso();
        Integer nroHabitacion = request.getNroHabitacion();

        if (nroPiso == null || nroHabitacion == null) {
            throw new ReglaNegocioException("El piso y el número de habitación son obligatorios");
        }

        //Buscar la habitación
        Habitacion habitacion = habitacionDAO
                .findByIdNroPisoAndIdNroHabitacion(nroPiso, nroHabitacion)
                .orElseThrow(()
                        -> new ReglaNegocioException(
                        "No existe la habitación piso " + nroPiso
                        + " número " + nroHabitacion)
                );

        LocalDate desde = request.getFechaIngreso();
        LocalDate hasta = request.getFechaEgreso();

        //Verificar solapamiento de estadías
        List<Estadia> solapadas
                = estadiaDAO.buscarPorHabitacionYRangoFechas(habitacion, desde, hasta);

        if (!solapadas.isEmpty()) {
            throw new ReglaNegocioException(
                    "La habitación piso " + nroPiso + " número " + nroHabitacion
                    + " ya tiene estadías en ese rango de fechas");
        }

        //Verificar reservas en ese rango
        List<Reserva> reservas
                = reservaDAO.buscarPorHabitacionYRangoFechas(habitacion, desde, hasta);

        if (!reservas.isEmpty() && !request.isOcuparIgualSiReservada()) {
            throw new ReglaNegocioException(
                    "La habitación piso " + nroPiso + " número " + nroHabitacion
                    + " se encuentra reservada en ese rango de fechas");
        }

        //Tomamos una reserva (la primera) si existe
        Reserva reservaAsociada = reservas.isEmpty() ? null : reservas.get(0);

        // Resolver huéspedes a partir de los HuespedId(DTO)
        List<Huesped> huespedes = new ArrayList<>();

        if (request.getHuespedes() != null && !request.getHuespedes().isEmpty()) {
            for (HuespedIdDTO dto : request.getHuespedes()) {

                HuespedId id = new HuespedId(dto.getNroDoc(), dto.getTipoDoc());

                Huesped h = huespedDAO.findById(id)
                    .orElseThrow(() -> new ReglaNegocioException(
                    "No existe huésped " + dto.getTipoDoc() + " " + dto.getNroDoc()
                ));

                huespedes.add(h);
            }
        }

        //Crear la Estadia
        Estadia estadia = new Estadia();
        estadia.setFechaIngreso(desde);
        estadia.setFechaEgreso(hasta);
        estadia.setHabitacion(habitacion);
        estadia.setReserva(reservaAsociada);
        estadia.setHuespedes(huespedes);

        //Actualizar estado de la habitación a OCUPADA
        habitacion.setEstado(EstadoHabitacion.Ocupada);
        habitacionDAO.save(habitacion);

        //Guardar estadía
        Estadia guardada = estadiaDAO.save(estadia);

        //Armar el response
        EstadiaOcuparResponse response = new EstadiaOcuparResponse();
        response.setEstadiaId(guardada.getId());
        response.setNroPiso(habitacion.getId().getNroPiso());
        response.setNroHabitacion(habitacion.getId().getNroHabitacion());
        response.setFechaIngreso(guardada.getFechaIngreso());
        response.setFechaEgreso(guardada.getFechaEgreso());
        response.setMensaje(
                "Habitación piso " + nroPiso
                + " número " + nroHabitacion
                + " ocupada correctamente."
        );
        
        return response;
    }
}