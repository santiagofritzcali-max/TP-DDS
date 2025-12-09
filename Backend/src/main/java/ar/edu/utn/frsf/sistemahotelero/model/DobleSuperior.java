package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;


@Entity
@DiscriminatorValue("DOBLE_SUPERIOR")


public class DobleSuperior extends Habitacion {
  @Override public TipoHabitacion getTipoHabitacion() { return TipoHabitacion.DOBLE_SUPERIOR; }
}
