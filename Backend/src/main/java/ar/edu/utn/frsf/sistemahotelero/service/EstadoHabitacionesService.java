package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadoHabitacionesResponse.*;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstadoHabitacionesService {

    private final HabitacionDAO habitacionDAO;
    private final ReservaDAO reservaDAO;
    private final EstadiaDAO estadiaDAO;

    public EstadoHabitacionesService(HabitacionDAO habitacionDAO,
                                     ReservaDAO reservaDAO,
                                     EstadiaDAO estadiaDAO) {
        this.habitacionDAO = habitacionDAO;
        this.reservaDAO = reservaDAO;
        this.estadiaDAO = estadiaDAO;
    }

    @Transactional(readOnly = true)
    public EstadoHabitacionesResponse obtener(LocalDate desde, LocalDate hasta) {
        if (desde == null || hasta == null) {
            throw new IllegalArgumentException("Las fechas 'desde' y 'hasta' son obligatorias.");
        }
        if (hasta.isBefore(desde)) {
            throw new IllegalArgumentException("'hasta' no puede ser anterior a 'desde'.");
        }

        // 1) Habitaciones ordenadas
        List<Habitacion> habitaciones = habitacionDAO.findAllOrdenadas();

        // 2) Días inclusivo
        List<LocalDate> dias = buildDiasInclusivo(desde, hasta);

        // 3) Cargar reservas/estadías por habitación (una consulta por habitación, no por celda)
        Map<HabitacionId, List<Reserva>> reservasPorHab = new HashMap<>();
        Map<HabitacionId, List<Estadia>> estadiasPorHab = new HashMap<>();

        for (Habitacion h : habitaciones) {
            HabitacionId id = h.getId(); // requiere @EmbeddedId en Habitacion
            reservasPorHab.put(id,
                    safeList(reservaDAO.buscarPorHabitacionYRangoFechas(h, desde, hasta)));
            estadiasPorHab.put(id,
                    safeList(estadiaDAO.buscarPorHabitacionYRangoFechas(h, desde, hasta)));
        }

        // 4) Grupos por tipo (para el front)
        List<GrupoHabitaciones> grupos = buildGrupos(habitaciones);

        // 5) Filas por día con celdas por habitación
        List<FilaDia> filas = new ArrayList<>();
        for (LocalDate dia : dias) {
            List<Celda> celdas = new ArrayList<>(habitaciones.size());

            for (Habitacion h : habitaciones) {
                HabitacionId id = h.getId();
                EstadoHabitacion estado = calcularEstadoCelda(
                        h,
                        dia,
                        reservasPorHab.get(id),
                        estadiasPorHab.get(id)
                );

                HabitacionKey key = new HabitacionKey(id.getNroPiso(), id.getNroHabitacion());
                Reserva reservaDelDia = EstadoHabitacion.Reservada.equals(estado)
                        ? findReservaParaDia(reservasPorHab.get(id), dia)
                        : null;

                ReservaInfo reservaInfo = toReservaInfo(reservaDelDia);

                // mandamos el nombre del enum al front (Reservada, Ocupada, Disponible, FueraServicio)
                celdas.add(new Celda(key, estado.name(), reservaInfo));
            }

            filas.add(new FilaDia(dia, celdas));
        }

        return new EstadoHabitacionesResponse(desde, hasta, dias, grupos, filas);
    }

    private List<GrupoHabitaciones> buildGrupos(List<Habitacion> habitaciones) {
        // Preserva orden de entrada (si habitaciones viene ordenada ya, el grupo queda prolijo)
        Map<String, List<Habitacion>> porTipo = habitaciones.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getTipoHabitacion().name(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));


        List<GrupoHabitaciones> grupos = new ArrayList<>();
        for (Map.Entry<String, List<Habitacion>> entry : porTipo.entrySet()) {
            String tipo = entry.getKey();
            List<HabitacionCol> cols = entry.getValue().stream()
                    .map(h -> {
                        HabitacionId id = h.getId();
                        HabitacionKey key = new HabitacionKey(id.getNroPiso(), id.getNroHabitacion());
                        String numero = id.getNroPiso() + "-" + id.getNroHabitacion();
                        return new HabitacionCol(key, numero);
                    })
                    .toList();

            grupos.add(new GrupoHabitaciones(tipo, cols));
        }

        return grupos;
    }

    private EstadoHabitacion calcularEstadoCelda(Habitacion h, LocalDate dia,
                                                List<Reserva> reservasHab,
                                                List<Estadia> estadiasHab) {

        // 1) FUERA DE SERVICIO si la habitación está marcada así
        if (h.getEstado() == EstadoHabitacion.FueraServicio) {
            return EstadoHabitacion.FueraServicio;
        }

        // 2) OCUPADA si hay alguna estadía que cubra el día (inclusivo)
        if (estadiasHab != null) {
            boolean ocupada = estadiasHab.stream().anyMatch(e ->
                    enRangoInclusivo(dia, e.getFechaIngreso(), e.getFechaEgreso())
            );
            if (ocupada) return EstadoHabitacion.Ocupada;
        }

        // 3) RESERVADA si hay alguna reserva que cubra el día (inclusivo)
        if (reservasHab != null) {
            boolean reservada = reservasHab.stream().anyMatch(r ->
                    enRangoInclusivo(dia, r.getFechaInicio(), r.getFechaFin())
            );
            if (reservada) return EstadoHabitacion.Reservada;
        }

        // 4) Si nada de lo anterior aplica, está disponible
        return EstadoHabitacion.Disponible;
    }

    private Reserva findReservaParaDia(List<Reserva> reservas, LocalDate dia) {
        if (reservas == null || dia == null) return null;

        return reservas.stream()
                .filter(r -> enRangoInclusivo(dia, r.getFechaInicio(), r.getFechaFin()))
                .findFirst()
                .orElse(null);
    }

    private ReservaInfo toReservaInfo(Reserva reserva) {
        if (reserva == null) return null;

        return new ReservaInfo(
                reserva.getId(),
                reserva.getFechaInicio(),
                reserva.getFechaFin(),
                reserva.getNombre(),
                reserva.getApellido(),
                reserva.getTelefono()
        );
    }

    private static boolean enRangoInclusivo(LocalDate dia, LocalDate inicio, LocalDate fin) {
        if (dia == null || inicio == null || fin == null) return false;
        return !dia.isBefore(inicio) && !dia.isAfter(fin);
    }

    private static List<LocalDate> buildDiasInclusivo(LocalDate desde, LocalDate hasta) {
        List<LocalDate> dias = new ArrayList<>();
        for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1)) {
            dias.add(d);
        }
        return dias;
    }

    private static <T> List<T> safeList(List<T> list) {
        return list == null ? List.of() : list;
    }
}
