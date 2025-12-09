package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "G17_estadia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estadia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; 

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_egreso", nullable = false)
    private LocalDate fechaEgreso;

    @ManyToOne(optional = false)
    @JoinColumns({
      @JoinColumn(name="nro_piso", referencedColumnName="nro_piso"),
      @JoinColumn(name="nro_habitacion", referencedColumnName="nro_habitacion")
    })
    private Habitacion habitacion;


    @OneToOne(optional = true)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @ManyToMany
    @JoinTable(
        name = "G17_estadia_huesped",
        joinColumns = @JoinColumn(name = "estadia_id", referencedColumnName = "id"),
        inverseJoinColumns = {
            @JoinColumn(name = "huesped_nro_doc", referencedColumnName = "nro_doc"),
            @JoinColumn(name = "huesped_tipo_doc", referencedColumnName = "tipo_doc")
        }
    )
    private List<Huesped> huespedes;
    
    @OneToMany
    private List<Factura> facturas;
}

