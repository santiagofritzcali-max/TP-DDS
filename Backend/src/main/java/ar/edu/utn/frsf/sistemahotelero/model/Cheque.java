package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.ChequeId;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@DiscriminatorValue("Cheque")  // Diferenciamos este tipo de MedioPago
@IdClass(ChequeId.class)  // Usamos MedioPagoId para la clave primaria compuesta
public class Cheque extends MedioPago {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago", insertable = false, updatable = false)
    private Pago pago;  // Relación con Pago (parte de la clave primaria compuesta)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCheque")
    private Long nroCheque;  // Parte de la clave primaria compuesta

    private String nombrePropietario;

    private String banco;
    
    private String plazo;
    
    private Date fechaCobro;

    // Getters y Setters
}
