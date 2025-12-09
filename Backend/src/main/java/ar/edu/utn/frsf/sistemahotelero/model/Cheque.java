package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "G17_cheque")
public class Cheque extends MedioPago {

    @Column(name = "idCheque")
    private Long nroCheque;

    private String nombrePropietario;

    private String banco;
    
    private String plazo;
    
    private Date fechaCobro;

    // Getters y Setters
}
