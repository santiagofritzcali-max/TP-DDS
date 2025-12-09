package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;

public class MonedaExtranjeraId implements Serializable {

    private Long idPago;  // Clave primaria de MedioPago, relacionada con Pago
    private String tipoMoneda;  // Atributo discriminador que también forma parte de la clave primaria compuesta

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MonedaExtranjeraId that = (MonedaExtranjeraId) o;
        return idPago.equals(that.idPago) && tipoMoneda.equals(that.tipoMoneda);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPago, tipoMoneda);
    }
}
