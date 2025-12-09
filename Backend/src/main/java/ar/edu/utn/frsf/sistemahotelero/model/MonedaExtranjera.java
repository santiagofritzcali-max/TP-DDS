package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "G17_moneda_extranjera")
public class MonedaExtranjera extends MedioPago {

    @Column(name = "tipoMoneda") 
    private String tipoMoneda;  

    private BigDecimal cotizacion;

}
