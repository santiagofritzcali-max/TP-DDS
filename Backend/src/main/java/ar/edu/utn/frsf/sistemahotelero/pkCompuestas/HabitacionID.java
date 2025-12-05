package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import java.io.Serializable;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HuespedId implements Serializable {

    private Integer nroPiso;
    private Integer nroHabitacion;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        HuespedId that = (HuespedId) obj;
        return nroPiso.equals(that.nroPiso) && nroHabitacion == that.nroHabitacion;
    }

    @Override
    public int hashCode() {
        return 31 * nroHabitacion.hashCode() + nroPiso.hashCode();
    }
}
