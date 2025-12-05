package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.*;
import ar.edu.utn.frsf.sistemahotelero.model.*;
import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstadoHabitacionesService {
  
    @Autowired
    private HabitacionDAO habitacionDAO;
    
    @Autowired
    private ReservaDAO reservaDAO;
    
    @Autowired
    private EstadiaDAO estadiaDAO;

  public EstadoHabitacionesService(HabitacionDAO h, ReservaDAO r, EstadiaDAO e) {
    this.habitacionDAO = h; this.reservaDAO = r; this.estadiaDAO = e;
  }

  @Transactional(readOnly = true)
  public EstadoHabitacionesResponse obtener(LocalDate desde, LocalDate hasta) {

    // 1) columnas (habitaciones) ordenadas por tipo y número
    List<Habitacion> habitaciones = habitacionDAO.findAllOrdenadas();
    Map<HabitacionId, Habitacion> habPorId = habitaciones.stream()
        .collect(Collectors.toMap(
                      h -> new HabitacionId(h.getNroPiso(), h.getNroHabitacion()),
                      h -> h));
                

    // 2) rango de días (inclusivo)
    List<LocalDate> dias = new ArrayList<>();
    for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1)) dias.add(d);

    // 3) cargar eventos solapados (un solo hit a DB)
    List<Reserva> reservas = reservaDAO.findSolapadas(desde, hasta);
    List<Estadia> estadias = estadiaDAO.findSolapadas(desde, hasta);

    // 4) indexar por habitación para lookup rápido
    Map<String, List<Reserva>> resPorHab = reservas.stream().collect(Collectors.groupingBy(r -> r.getHabitacion().getNroPiso()));
    Map<String, List<Estadia>> estPorHab = estadias.stream().collect(Collectors.groupingBy(e -> e.getHabitacion().getNroHabitacion()));

    // 5) grupos por tipo (para el front, como en tu imagen)
    List<GrupoHabitaciones> grupos = habitaciones.stream()
        .collect(Collectors.groupingBy(h -> h.getTipoDeHabitacion().name(), LinkedHashMap::new, Collectors.toList()))
        .entrySet().stream()
        .map(e -> new GrupoHabitaciones(
            e.getKey(),
            e.getValue().stream().map(h -> new HabitacionCol(new HabitacionId(h.getNroPiso(), 
                    h.getNroHabitacion())
                    h.getNroHabitacion())).toList()))
                    .toList();

    // 6) construir filas
    List<FilaDia> filas = new ArrayList<>();
    for (LocalDate dia : dias) {
      List<Celda> celdas = new ArrayList<>(habitaciones.size());
      for (Habitacion h : habitaciones) {
        EstadoCelda estado = calcularEstadoCelda(h, dia, resPorHab.get(h.getId()), estPorHab.get(h.getId()));
        celdas.add(new Celda(h.getId(), estado.name()));
      }
      filas.add(new FilaDia(dia, celdas));
    }

    return new EstadoHabitacionesResponse(desde, hasta, dias, grupos, filas);
  }

  private EstadoCelda calcularEstadoCelda(
      Habitacion h,
      LocalDate dia,
      List<Reserva> reservasHab,
      List<Estadia> estadiasHab
  ) {
    // 1) no disponible por estado de habitación
    if (h.getEstado() == EstadoHabitacion.NO_DISPONIBLE) return EstadoCelda.NO_DISPONIBLE;

    // 2) ocupada si hay estadía que cubre el día (inclusivo)
    if (estadiasHab != null) {
      boolean ocupado = estadiasHab.stream().anyMatch(e ->
          !dia.isBefore(e.getFechaIngreso()) && !dia.isAfter(e.getFechaEgreso())
      );
      if (ocupado) return EstadoCelda.OCUPADA;
    }

    // 3) reservada si hay reserva que cubre el día (inclusivo)  ✅ tu regla
    if (reservasHab != null) {
      boolean reservada = reservasHab.stream().anyMatch(r ->
          !dia.isBefore(r.getFechaInicio()) && !dia.isAfter(r.getFechaFin())
      );
      if (reservada) return EstadoCelda.RESERVADA;
    }

    return EstadoCelda.DISPONIBLE;
  }
}
