package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TarjetaDebito") 
public class TarjetaDebito extends Tarjeta {

}
