package ar.edu.utn.frsf.sistemahotelero.dto;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoCama;

//DTO de una habitación disponible para mostrar en la grilla de la UI

public class HabitacionDisponibleResponse {

    private String numero;
    private String piso;
    private EstadoHabitacion estado;
    private Double tarifaBase;
    private String descripcion;
    private Integer cantidadCamas;
    private TipoCama tipoDeCama;

    // Getters y setters
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getPiso() { return piso; }
    public void setPiso(String piso) { this.piso = piso; }

    public EstadoHabitacion getEstado() { return estado; }
    public void setEstado(EstadoHabitacion estado) { this.estado = estado; }

    public Double getTarifaBase() { return tarifaBase; }
    public void setTarifaBase(Double tarifaBase) { this.tarifaBase = tarifaBase; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getCantidadCamas() { return cantidadCamas; }
    public void setCantidadCamas(Integer cantidadCamas) { this.cantidadCamas = cantidadCamas; }

    public TipoCama getTipoDeCama() { return tipoDeCama; }
    public void setTipoDeCama(TipoCama tipoDeCama) { this.tipoDeCama = tipoDeCama; }
}
