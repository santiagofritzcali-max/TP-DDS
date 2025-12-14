package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "G17_moneda_extranjera")
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "idMedioPago")
public class MonedaExtranjera extends MedioPago {

    @Column(name = "tipoMoneda")
    private String tipoMoneda;

    private BigDecimal cotizacion;
}
