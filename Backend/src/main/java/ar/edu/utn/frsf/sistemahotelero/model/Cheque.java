package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "G17_cheque")
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "idMedioPago")
public class Cheque extends MedioPago {

    @Column(name = "nroCheque")
    private String nroCheque;

    private String nombrePropietario;

    private String banco;

    private String plazo;

    @Temporal(TemporalType.DATE)
    private Date fechaCobro;
}
