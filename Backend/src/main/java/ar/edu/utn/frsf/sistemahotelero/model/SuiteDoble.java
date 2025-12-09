package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;


@Entity
@DiscriminatorValue("SUITE_DOBLE")


public class SuiteDoble extends Habitacion {
  @Override public TipoHabitacion getTipoHabitacion() { return TipoHabitacion.SUITE_DOBLE; }
}
