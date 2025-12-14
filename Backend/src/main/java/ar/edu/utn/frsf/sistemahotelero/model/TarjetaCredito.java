package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "G17_tarjeta_credito")
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "idMedioPago")
public class TarjetaCredito extends Tarjeta {

    private Integer cuotas;
}
