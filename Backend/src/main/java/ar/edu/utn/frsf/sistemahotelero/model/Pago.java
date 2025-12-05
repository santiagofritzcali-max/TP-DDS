package ar.edu.utn.frsf.sistemahotelero.model;

import java.util.Date;


public class Pago {
    private Date fecha;
    private double monto;
    private Factura factura;

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public Factura getFactura() {
        return factura;
    }

    public void setFactura(Factura factura) {
        this.factura = factura;
    }

}

