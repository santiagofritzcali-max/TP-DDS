package ar.edu.utn.frsf.sistemahotelero.excepciones;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) 
public class HuespedDuplicadoException extends RuntimeException {

    public HuespedDuplicadoException(TipoDocumento tipoDoc, String nroDoc) {
        super("Ya existe un huésped con " + tipoDoc + " " + nroDoc);
    }
}
