package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;

public class EfectivoId implements Serializable {

    private Long idPago;  // Clave primaria de MedioPago, relacionada con Pago
    private Long idEfectivo;  // Identificador único para Efectivo

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EfectivoId that = (EfectivoId) o;
        return idPago.equals(that.idPago) && idEfectivo.equals(that.idEfectivo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPago, idEfectivo);
    }
}
