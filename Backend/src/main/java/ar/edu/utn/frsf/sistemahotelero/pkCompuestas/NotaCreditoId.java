package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;

public class NotaCreditoId implements Serializable {

    private int numero;
    private Long facturaId;  // Suponiendo que el id de Factura es de tipo Long

    // Getters, setters, equals y hashCode

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NotaCreditoId that = (NotaCreditoId) o;
        return numero == that.numero && facturaId.equals(that.facturaId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numero, facturaId);
    }
}