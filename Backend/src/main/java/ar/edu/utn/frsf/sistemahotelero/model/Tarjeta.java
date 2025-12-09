package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.TarjetaId;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@DiscriminatorValue("Tarjeta")  
@IdClass(TarjetaId.class)  
public abstract class Tarjeta extends MedioPago {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago", insertable = false, updatable = false)
    private Pago pago;  

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idTarjeta")
    private Long idTarjeta; 

    private String nombre;
    private String apellido;
    private String nroTarjeta;
    private Date fechaVencimiento;

}
