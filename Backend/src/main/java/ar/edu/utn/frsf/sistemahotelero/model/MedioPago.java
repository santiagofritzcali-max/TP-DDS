package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.*;
import java.util.Date;
import lombok.Data;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)  
@DiscriminatorColumn(name = "tipo_medio_pago", discriminatorType = DiscriminatorType.STRING)  
@Data
public abstract class MedioPago {

    @ManyToOne
    @JoinColumn(name = "idPago", referencedColumnName = "idPago")
    private Pago pago;  // Relación con Pago (clave primaria compuesta)

    private double monto;
    private Date fecha;

    // Getters y Setters
}
