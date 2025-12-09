package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name = "G17_reserva_prueba")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    @Column(name = "fecha_reserva")
    private LocalDate fechaReserva;

    private String nombre;
    private String apellido;
    private String telefono;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "habitacion_numero", referencedColumnName = "numero"),
        @JoinColumn(name = "habitacion_piso", referencedColumnName = "piso")
    })
    private Habitacion habitacion;
}
