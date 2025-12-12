package ar.edu.utn.frsf.sistemahotelero.excepciones;

import java.util.List;
import lombok.Getter;

@Getter
public class DatosBusquedaFacturacionException extends RuntimeException {

    private final List<String> errores;

    public DatosBusquedaFacturacionException(List<String> errores) {
        super("Errores en los datos de búsqueda para facturación");
        this.errores = errores;
    }
}
