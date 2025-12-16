package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "G17_pago")
@Getter
@Setter
@ToString(exclude = {"factura", "mediosDePago"})
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idPago;
    
    private Date fecha;
    
    private BigDecimal monto;
    
    @OneToOne(mappedBy = "pago")
    private Factura factura;  
    
    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedioPago> mediosDePago;
}
