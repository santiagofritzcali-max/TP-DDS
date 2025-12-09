package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "G17_tarjeta_credito")
public class TarjetaCredito extends Tarjeta {

    private Integer cuotas;

}
