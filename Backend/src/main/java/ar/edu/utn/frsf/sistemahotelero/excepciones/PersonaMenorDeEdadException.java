package ar.edu.utn.frsf.sistemahotelero.excepciones;

public class PersonaMenorDeEdadException extends ReglaNegocioException {

    public PersonaMenorDeEdadException() {
        super("El responsable debe ser mayor de edad.");
    }
}

