package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "G17_tarjeta")
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "idMedioPago")
public abstract class Tarjeta extends MedioPago {

    private String nombre;
    private String apellido;
    private Integer codigo;
    private String nroTarjeta;

    private Date fechaVencimiento;
}
