package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import lombok.*;

@Entity
@Table(name = "G17_factura")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = {"responsableDePago", "estadia", "pago", "notaCredito"})
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private long idFactura;

    @Column(name = "numero")
    private Integer numero;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_emision")
    private Date fechaEmision;

    @Column(name = "total", precision = 38, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo")
    private TipoFact tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private FacturaEstado estado = FacturaEstado.PENDIENTE;

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
