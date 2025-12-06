package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitacionId implements Serializable {

    private Integer nroPiso;
    private Integer nroHabitacion;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        HabitacionId that = (HabitacionId) obj;
        return nroPiso.equals(that.nroPiso) && Objects.equals(nroHabitacion, that.nroHabitacion);
    }

    /**
     *
     * @return
     */
    @Override
    public int hashCode() {
        return 31 * nroHabitacion.hashCode() + nroPiso.hashCode();
    }
}
