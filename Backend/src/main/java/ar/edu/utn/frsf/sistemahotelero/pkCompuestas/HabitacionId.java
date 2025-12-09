package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class HabitacionId implements Serializable {

  @Column(name = "nro_piso", nullable = false)
  private Integer nroPiso;

  @Column(name = "nro_habitacion", nullable = false)
  private Integer nroHabitacion;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof HabitacionId that)) return false;
    return Objects.equals(nroPiso, that.nroPiso)
        && Objects.equals(nroHabitacion, that.nroHabitacion);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nroPiso, nroHabitacion);
  }
}
