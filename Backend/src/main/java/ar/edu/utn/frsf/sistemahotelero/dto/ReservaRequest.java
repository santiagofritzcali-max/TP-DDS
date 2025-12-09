package ar.edu.utn.frsf.sistemahotelero.dto;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

//DTO que recibe la solicitud de reserva desde la UI

public class ReservaRequest {

    // Una entrada por habitación + rango
    private List<ReservaHabitacionRequest> reservas;

    private String nombre;
    private String apellido;
    private String telefono;

    // ===== Getters / Setters =====

    public List<ReservaHabitacionRequest> getReservas() {
        return reservas;
    }

    public void setReservas(List<ReservaHabitacionRequest> reservas) {
        this.reservas = reservas;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
