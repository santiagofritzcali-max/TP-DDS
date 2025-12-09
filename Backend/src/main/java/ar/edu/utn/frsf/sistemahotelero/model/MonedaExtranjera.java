package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.MonedaExtranjeraId;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("MonedaExtranjera")  
@IdClass(MonedaExtranjeraId.class)  
public class MonedaExtranjera extends MedioPago {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago", insertable = false, updatable = false)
    private Pago pago;  

    @Id
    @Column(name = "tipoMoneda") 
    private String tipoMoneda;  

    private double cotizacion;

}
