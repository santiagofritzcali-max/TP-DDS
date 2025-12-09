package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "G17_medio_pago")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)  
@DiscriminatorColumn(name = "tipo_medio_pago", discriminatorType = DiscriminatorType.STRING)  
@Getter
@Setter
@ToString(exclude = "pago")
public abstract class MedioPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMedioPago")
    private Long idMedioPago;  
    
    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago")
    private Pago pago;

    private BigDecimal monto;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;

}
