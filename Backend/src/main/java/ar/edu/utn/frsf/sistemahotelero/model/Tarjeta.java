package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "G17_tarjeta")
public abstract class Tarjeta extends MedioPago {

    @Column(name = "idTarjeta")
    private Long idTarjeta;

    private String nombre;
    private String apellido;
    private String nroTarjeta;

    @Temporal(TemporalType.DATE)
    private Date fechaVencimiento;

}
