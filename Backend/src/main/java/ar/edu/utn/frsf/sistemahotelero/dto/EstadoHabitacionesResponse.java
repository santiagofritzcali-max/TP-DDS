package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import java.util.*;

public record EstadoHabitacionesResponse(
  LocalDate desde,
  LocalDate hasta,
  List<LocalDate> dias,
  List<GrupoHabitaciones> grupos,          // columnas agrupadas por tipo
  List<FilaDia> filas                       // filas por día
) {}

public record GrupoHabitaciones(String tipoHabitacion, List<HabitacionCol> habitaciones) {}
public record HabitacionCol(Long id, String numero) {}

public record FilaDia(LocalDate dia, List<Celda> celdas) {}
public record Celda(Long habitacionId, String estado) {} // estado = DISPONIBLE/RESERVADA/...
