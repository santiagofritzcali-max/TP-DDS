package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@DiscriminatorValue("Tarjeta")
public abstract class Tarjeta extends MedioPago {

    @Column(name = "idTarjeta")
    private Long idTarjeta;

    private String nombre;
    private String apellido;
    private String nroTarjeta;

    @Temporal(TemporalType.DATE)
    private Date fechaVencimiento;

}
