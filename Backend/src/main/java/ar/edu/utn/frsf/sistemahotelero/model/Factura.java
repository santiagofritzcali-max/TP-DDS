package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import jakarta.persistence.*;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="G17_factura")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Factura {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idFactura;
    
    private int numero;
    
    private Date fechaEmision;
    
    private double total;
    
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
    @JoinColumn(name = "nota_credito_id", referencedColumnName = "idFactura")  
    private NotaCredito notaCredito;  
}
