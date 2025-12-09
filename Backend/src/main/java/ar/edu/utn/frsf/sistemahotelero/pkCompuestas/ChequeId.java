package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;

public class ChequeId implements Serializable {

    private Long idPago;  
    private Long nroCheque;  

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChequeId chequeId = (ChequeId) o;
        return idPago.equals(chequeId.idPago) && nroCheque.equals(chequeId.nroCheque);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPago, nroCheque);
    }
}
