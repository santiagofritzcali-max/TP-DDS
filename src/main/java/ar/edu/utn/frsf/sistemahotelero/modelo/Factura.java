package ar.edu.utn.frsf.sistemahotelero.modelo;

import java.util.Date;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;

public class Factura {
    private int numero;
    private Date fechaEmision;
    private double total;
    private TipoFact tipo;
    private ResponsableDePago responsableDePago;
    private Estadia estadia;
    private Pago pago;
    private NotaCredito notaCredito;

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public Date getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(Date fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public TipoFact getTipo() {
        return tipo;
    }

    public void setTipo(TipoFact tipo) {
        this.tipo = tipo;
    }

    public ResponsableDePago getResponsableDePago() {
        return responsableDePago;
    }

    public void setResponsableDePago(ResponsableDePago responsableDePago) {
        this.responsableDePago = responsableDePago;
    }

    public Estadia getEstadia() {
        return estadia;
    }

    public void setEstadia(Estadia estadia) {
        this.estadia = estadia;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }


    public NotaCredito getNotaCredito() {
        return notaCredito;
    }

    public void setNotaCredito(NotaCredito notaCredito) {
        this.notaCredito = notaCredito;
    }
}
