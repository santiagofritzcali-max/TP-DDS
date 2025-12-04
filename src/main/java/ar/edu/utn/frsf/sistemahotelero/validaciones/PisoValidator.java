package ar.edu.utn.frsf.sistemahotelero.validaciones;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PisoValidator implements ConstraintValidator<ValidPiso, String> {

    @Override
    public boolean isValid(String piso, ConstraintValidatorContext context) {
        // Si el campo es nulo o vacío, lo consideramos válido
        if (piso == null || piso.trim().isEmpty()) {
            return true;
        }
        // Si el campo no es nulo, debe contener solo números
        return piso.matches("^[0-9]+$");
    }
}
