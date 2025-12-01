package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.Consumos;
import java.util.Date;


public class Servicio {
    private String nombre;
    private Date fecha;
    private String descripcion;
    private Double costo;
    private Consumos tipoConsumo;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getCosto() {
        return costo;
    }

    public void setCosto(Double costo) {
        this.costo = costo;
    }

    public Consumos getTipoConsumo() {
        return tipoConsumo;
    }

    public void setTipoConsumo(Consumos tipoConsumo) {
        this.tipoConsumo = tipoConsumo;
    }
    
    
}
