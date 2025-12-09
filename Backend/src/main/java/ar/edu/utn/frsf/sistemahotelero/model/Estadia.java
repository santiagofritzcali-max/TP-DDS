package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name = "G17_estadia_prueba")
public class Estadia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;
    
    @Column(name = "fecha_egreso")
    private LocalDate fechaEgreso;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "habitacion_numero", referencedColumnName = "numero"),
        @JoinColumn(name = "habitacion_piso", referencedColumnName = "piso")
    })
    private Habitacion habitacion;
}
