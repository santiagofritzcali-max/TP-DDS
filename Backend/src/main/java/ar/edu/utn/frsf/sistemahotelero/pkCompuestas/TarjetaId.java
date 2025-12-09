package ar.edu.utn.frsf.sistemahotelero.pkCompuestas;

import java.io.Serializable;
import java.util.Objects;

public class TarjetaId implements Serializable {

    private Long idPago;  
    private Long idTarjeta;  

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TarjetaId tarjetaId = (TarjetaId) o;
        return idPago.equals(tarjetaId.idPago) && idTarjeta.equals(tarjetaId.idTarjeta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPago, idTarjeta);
    }
}
