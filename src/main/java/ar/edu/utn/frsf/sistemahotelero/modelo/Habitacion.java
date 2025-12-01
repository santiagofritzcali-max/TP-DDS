package ar.edu.utn.frsf.sistemahotelero.modelo;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.tipoCama;

public abstract class Habitacion {
    private String numero;
    private String piso;
    private EstadoHabitacion estado;
    private Double tarifaBase;
    private String descripcion;
    private Integer cantidadCamas;
    private tipoCama tipoDeCama;

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getPiso() {
        return piso;
    }

    public void setPiso(String piso) {
        this.piso = piso;
    }

    public EstadoHabitacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoHabitacion estado) {
        this.estado = estado;
    }

    public Double getTarifaBase() {
        return tarifaBase;
    }

    public void setTarifaBase(Double tarifaBase) {
        this.tarifaBase = tarifaBase;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getCantidadCamas() {
        return cantidadCamas;
    }

    public void setCantidadCamas(Integer cantidadCamas) {
        this.cantidadCamas = cantidadCamas;
    }

    public tipoCama getTipoDeCama() {
        return tipoDeCama;
    }

    public void setTipoDeCama(tipoCama tipoDeCama) {
        this.tipoDeCama = tipoDeCama;
    }
    
    
}
