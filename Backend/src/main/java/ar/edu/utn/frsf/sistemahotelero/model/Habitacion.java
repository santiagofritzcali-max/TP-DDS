package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.*;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "G17_habitacion")
@IdClass(HabitacionId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Habitacion {

    @Id
    @Column(name = "nro_piso", nullable = false)
    private String nroPiso;

    @Id
    @Column(name = "nro_habitacion", nullable = false)
    private String nroHabitacion;


    @Enumerated(EnumType.STRING)
    @Column(name = "tipoDeHabitacion", nullable = false)
    private TipoHabitacion tipoDeHabitacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipoDeCama", nullable = false)
    private tipoCama tipoDeCama;

    @Column(name = "cantidadCamas", nullable = false)
    private Integer cantidadCamas;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoHabitacion estado;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "tarifa", nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifa;

    public Habitacion(String nroPiso, String nroHabitacion) {
        this.nroPiso = nroPiso;
        this.nroHabitacion = nroHabitacion;
    }
    
    
}