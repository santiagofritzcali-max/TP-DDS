package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.HuespedIdDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import ar.edu.utn.frsf.sistemahotelero.util.HabitacionKeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

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

    // =============================================================
    // CU04 - Reservar habitaciones (N habitaciones, cada una con su rango)
    // =============================================================
    @Override
    @Transactional
    public List<Reserva> reservarHabitaciones(List<ReservaHabitacionRequest> reservasRequest,
                                              String nombre,
                                              String apellido,
                                              String telefono) {

        if (reservasRequest == null || reservasRequest.isEmpty()) {
            throw new IllegalArgumentException("Se debe enviar al menos una habitación a reservar.");
        }

        List<Reserva> reservasCreadas = new ArrayList<>();

        // Para evitar duplicar EXACTAMENTE la misma reserva (misma hab + mismo rango)
        Set<String> clavesProcesadas = new HashSet<>();

        for (ReservaHabitacionRequest rReq : reservasRequest) {

            String nro = rReq.getNumeroHabitacion();
            LocalDate fechaInicio = rReq.getFechaInicio();
            LocalDate fechaFin = rReq.getFechaFin();

            String clave = nro + "|" + fechaInicio + "|" + fechaFin;
            if (!clavesProcesadas.add(clave)) {
                // Ya procesamos esa combinación exacta, la saltamos
                continue;
            }

            HabitacionId id = HabitacionKeyUtil.parse(nro);
            Habitacion habitacion = habitacionDAO.findById(id)
                    .orElseThrow(() ->
                            new IllegalArgumentException("No existe la habitación " + nro));

            // Validación de disponibilidad SOLO en el rango de ESA habitación
            if (!gestorHabitacion.validarDisponibilidad(habitacion, fechaInicio, fechaFin)) {
                throw new IllegalStateException("La habitación " + nro + " no está disponible.");
            }

            // Crear reserva con SU rango propio
            Reserva r = new Reserva();
            r.setHabitacion(habitacion);
            r.setFechaInicio(fechaInicio);
            r.setFechaFin(fechaFin);
            r.setFechaReserva(LocalDate.now());
            r.setNombre(nombre);
            r.setApellido(apellido);
            r.setTelefono(telefono);

            Reserva guardada = reservaDAO.save(r);
            reservasCreadas.add(guardada);
        }

        return reservasCreadas;
    }

    // =============================================================
    // CU05 - Ocupar habitación (SIN CAMBIOS)
    // =============================================================
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

        //Resolver huéspedes a partir de los HuespedId(DTO)
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
