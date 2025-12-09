package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.NotaCreditoId;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="G17_nota_credito")
@Data
@AllArgsConstructor
@NoArgsConstructor
@IdClass(NotaCreditoId.class)   

public class NotaCredito {

    @Id  
    private int numero;  

    @Id  
    @ManyToOne
    @JoinColumn(name = "factura_id", referencedColumnName = "idFactura")  
    private Factura factura;  

    private Date fecha;

    @OneToMany(mappedBy = "notaCredito")  
    private List<Factura> facturasCanceladas; 
}
