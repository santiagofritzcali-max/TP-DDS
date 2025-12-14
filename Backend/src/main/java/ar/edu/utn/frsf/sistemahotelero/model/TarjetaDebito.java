package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "G17_tarjeta_debito")
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "idMedioPago")
public class TarjetaDebito extends Tarjeta {

}
