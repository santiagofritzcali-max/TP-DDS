package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.DiaEstadoResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.HabitacionEstadoResponse;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GestorHabitacionImpl implements GestorHabitacion {

    @Autowired
    private HabitacionDAO habitacionDAO;

    @Autowired
    private GestorReserva gestorReserva;

    @Override
    public EstadoHabitacionesResponse obtenerEstadoHabitaciones(EstadoHabitacionesRequest request) {

        LocalDate desde = request.getDesde();
        LocalDate hasta = request.getHasta();

        // Validaciones de fechas (flujos alternativos 3A y 4A)
        if (desde == null || hasta == null) {
            throw new IllegalArgumentException("Las fechas 'desde' y 'hasta' son obligatorias.");
        }
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("La fecha 'hasta' no puede ser anterior a 'desde'.");
        }

        // CrudRepository#findAll devuelve Iterable → lo convertimos a List
        List<Habitacion> habitaciones = StreamSupport
                .stream(habitacionDAO.findAll().spliterator(), false)
                .collect(Collectors.toList());

        List<Reserva> reservas = gestorReserva.obtenerReservasEnRango(desde, hasta);
        List<Estadia> estadias = gestorReserva.obtenerEstadiasEnRango(desde, hasta);

        // Agrupamos por HabitacionId (numero + piso)
        Map<HabitacionId, List<Reserva>> reservasPorHab = reservas.stream()
                .collect(Collectors.groupingBy(r ->
                        new HabitacionId(
                                r.getHabitacion().getNumero(),
                                r.getHabitacion().getPiso()
                        )));

        Map<HabitacionId, List<Estadia>> estadiasPorHab = estadias.stream()
                .collect(Collectors.groupingBy(e ->
                        new HabitacionId(
                                e.getHabitacion().getNumero(),
                                e.getHabitacion().getPiso()
                        )));

        List<HabitacionEstadoResponse> habResponses = new ArrayList<>();

        for (Habitacion habitacion : habitaciones) {

            HabitacionEstadoResponse hr = new HabitacionEstadoResponse();
            hr.setNumero(habitacion.getNumero());
            hr.setPiso(habitacion.getPiso());
            hr.setDescripcion(habitacion.getDescripcion());
            hr.setTipoHabitacion(habitacion.getClass().getSimpleName());

            HabitacionId habId = new HabitacionId(habitacion.getNumero(), habitacion.getPiso());

            List<DiaEstadoResponse> dias = new ArrayList<>();

            LocalDate fecha = desde;
            while (!fecha.isAfter(hasta)) {
                DiaEstadoResponse dia = new DiaEstadoResponse();
                dia.setFecha(fecha);

                EstadoHabitacion estadoDia =
                        calcularEstadoDia(
                                habitacion,
                                fecha,
                                reservasPorHab.getOrDefault(habId, List.of()),
                                estadiasPorHab.getOrDefault(habId, List.of()),
                                dia
                        );

                dia.setEstado(estadoDia);
                dias.add(dia);

                fecha = fecha.plusDays(1);
            }

            hr.setEstadosPorDia(dias);
            habResponses.add(hr);
        }

        EstadoHabitacionesResponse response = new EstadoHabitacionesResponse();
        response.setDesde(desde);
        response.setHasta(hasta);
        response.setHabitaciones(habResponses);

        return response;
    }

    private EstadoHabitacion calcularEstadoDia(Habitacion habitacion,
                                               LocalDate fecha,
                                               List<Reserva> reservas,
                                               List<Estadia> estadias,
                                               DiaEstadoResponse diaDTO) {

        // 1) Si la habitación está fuera de servicio, manda siempre
        if (habitacion.getEstado() == EstadoHabitacion.FueraServicio) {
            return EstadoHabitacion.FueraServicio;
        }

        // 2) ¿Hay estadía que cubra ese día? → OCUPADA
        for (Estadia e : estadias) {
            if (!fecha.isBefore(e.getFechaIngreso())
                    && !fecha.isAfter(e.getFechaEgreso())) {
                diaDTO.setEstadiaId(e.getId());
                return EstadoHabitacion.Ocupada;
            }
        }

        // 3) ¿Hay reserva que cubra ese día? → RESERVADA
        for (Reserva r : reservas) {
            if (!fecha.isBefore(r.getFechaInicio())
                    && !fecha.isAfter(r.getFechaFin())) {
                diaDTO.setReservaId(r.getId());
                return EstadoHabitacion.Reservada;
            }
        }

        // 4) Si nada de lo anterior → DISPONIBLE
        return EstadoHabitacion.Disponible;
    }
}
