package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.EfectivoId;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("Efectivo")  
@IdClass(EfectivoId.class)  
public class Efectivo extends MedioPago {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago", insertable = false, updatable = false)
    private Pago pago; 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idEfectivo")
    private Long idEfectivo;  

  
}
