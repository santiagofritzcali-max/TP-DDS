package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;


@Entity
@DiscriminatorValue("INDIVIDUAL_ESTANDAR")

public class IndividualEstandar extends Habitacion {
  @Override public TipoHabitacion getTipoHabitacion() { return TipoHabitacion.INDIVIDUAL_ESTANDAR; }
}
