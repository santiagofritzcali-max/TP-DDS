package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import java.time.LocalDate;
import lombok.Data;

@Data

public class ReservaResponse {

    private Long idReserva;
    private HabitacionId habitacionId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String nombre;
    private String apellido;
    private String telefono;

    // Getters y setters
    /*
    public Long getIdReserva() { return idReserva; }
    public void setIdReserva(Long idReserva) { this.idReserva = idReserva; }

    public String getNumeroHabitacion() { return numeroHabitacion; }
    public void setNumeroHabitacion(String numeroHabitacion) { this.numeroHabitacion = numeroHabitacion; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
*/
}
