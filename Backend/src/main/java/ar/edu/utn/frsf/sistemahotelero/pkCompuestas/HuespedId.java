package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import java.io.Serializable;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HuespedId implements Serializable {

    private String nroDoc;
    private TipoDocumento tipoDoc;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        HuespedId that = (HuespedId) obj;
        return nroDoc.equals(that.nroDoc) && tipoDoc == that.tipoDoc;
    }

    @Override
    public int hashCode() {
        return 31 * nroDoc.hashCode() + tipoDoc.hashCode();
    }
}
