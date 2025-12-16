package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.Consumos;
import jakarta.persistence.*;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "G17_servicio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    
    private Date fecha;

    private String descripcion;

    private Double costo;

    @Enumerated(EnumType.STRING)
    private Consumos tipoConsumo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "estadia_id", referencedColumnName = "id")
    private Estadia estadia;
}

