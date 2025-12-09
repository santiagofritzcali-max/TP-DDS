package ar.edu.utn.frsf.sistemahotelero.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Representa la reserva de UNA habitación con su propio rango de fechas.
 * Ejemplo JSON:
 * {
 *   "numeroHabitacion": "1-301",
 *   "fechaInicio": "2026-01-01",
 *   "fechaFin": "2026-01-02"
 * }
 */
public class ReservaHabitacionRequest {

    // Ej: "1-201"
    private String numeroHabitacion;

    // LocalDate en formato ISO: "yyyy-MM-dd"
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;

    // ===== Getters / Setters =====

    public String getNumeroHabitacion() {
        return numeroHabitacion;
    }

    public void setNumeroHabitacion(String numeroHabitacion) {
        this.numeroHabitacion = numeroHabitacion;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
}
