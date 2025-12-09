package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitacionId implements Serializable {

    private Integer numero;
    private Integer piso;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        HabitacionId that = (HabitacionId) obj;
        return numero.equals(that.numero) && piso.equals(that.piso);
    }

    @Override
    public int hashCode() {
        return 31 * numero.hashCode() + piso.hashCode();
    }
}
