package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;


@Entity
@DiscriminatorValue("SUPERIOR_FAMILY")

public class SuperiorFamilyPlan extends Habitacion {
  @Override public TipoHabitacion getTipoHabitacion() { return TipoHabitacion.SUPERIOR_FAMILY; }
}