package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TarjetaCredito")  
public class TarjetaCredito extends Tarjeta {

    private Integer cuotas;

}
