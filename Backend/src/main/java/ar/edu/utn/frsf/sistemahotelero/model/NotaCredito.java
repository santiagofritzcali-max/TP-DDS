package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="G17_nota_credito")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "facturasCanceladas")

public class NotaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idNotaCredito;

    private int numero;  

    @ManyToOne(optional = false)
    @JoinColumn(name = "factura_id", referencedColumnName = "idFactura")  
    private Factura factura;  

    @Temporal(TemporalType.DATE)
    private Date fecha;

    @OneToMany(mappedBy = "notaCredito")  
    private List<Factura> facturasCanceladas; 
}
