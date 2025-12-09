package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("MonedaExtranjera")  
public class MonedaExtranjera extends MedioPago {

    @Column(name = "tipoMoneda") 
    private String tipoMoneda;  

    private BigDecimal cotizacion;

}
