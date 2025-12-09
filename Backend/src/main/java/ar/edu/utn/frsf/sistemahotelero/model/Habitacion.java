package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@IdClass(HabitacionId.class)
@Table(name = "G17_habitacion_prueba")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)  
@DiscriminatorColumn(name = "tipo_habitacion", discriminatorType = DiscriminatorType.STRING)
public abstract class Habitacion {
   
    @Id
    private Integer numero;
    
    @Id
    private Integer piso;

    @Enumerated(EnumType.STRING)
    private EstadoHabitacion estado;

    @Column(name = "tarifa_base")
    private Double tarifaBase;

    private String descripcion;

    // Relaciones
    @OneToMany(mappedBy = "habitacion")
    private List<Reserva> reservas = new ArrayList<>();

    @OneToMany(mappedBy = "habitacion")
    private List<Estadia> estadias = new ArrayList<>();
}