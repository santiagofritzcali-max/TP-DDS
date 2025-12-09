package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import lombok.Data;

@Entity
@Data
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idPago;
    
    private Date fecha;
    
    private double monto;
    
    @OneToOne(mappedBy = "pago")
    private Factura factura;  
    
    @OneToMany(mappedBy = "pago")
    private List<MedioPago> mediosDePago;
}
