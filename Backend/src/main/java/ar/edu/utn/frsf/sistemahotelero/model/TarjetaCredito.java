package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.TarjetaId;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("TarjetaCredito")  
@IdClass(TarjetaId.class)  
public class TarjetaCredito extends Tarjeta {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago", insertable = false, updatable = false)
    private Pago pago;  

    @Id
    @Column(name = "idTarjeta")
    private Long idTarjeta;  

    private Integer cuotas;

}
