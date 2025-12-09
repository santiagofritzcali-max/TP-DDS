package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="G17_factura")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = {"responsableDePago", "estadia", "pago", "notaCredito"})
public class Factura {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFactura;
    
    private int numero;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEmision;
    
    private BigDecimal total;
    
    @Enumerated(EnumType.STRING)
    private TipoFact tipo;
    
    @ManyToOne
    @JoinColumn(name = "responsable_pago_id", referencedColumnName = "id")  
    private ResponsableDePago responsableDePago;
    
    @ManyToOne
    @JoinColumn(name = "estadia_id", referencedColumnName = "id")  
    private Estadia estadia;
    
    @OneToOne(optional = true)
    @JoinColumn(name = "pago_id", referencedColumnName = "idPago")  
    private Pago pago;
    
    @ManyToOne(optional = true)
    @JoinColumn(name = "nota_credito_id", referencedColumnName = "idNotaCredito")  
    private NotaCredito notaCredito;  
}
