package ar.edu.utn.frsf.sistemahotelero.validaciones;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CuitValidator implements ConstraintValidator<ValidCuit, String> {

    @Override
    public void initialize(ValidCuit constraintAnnotation) {
        // Inicialización si es necesario
    }

    @Override
    public boolean isValid(String cuit, ConstraintValidatorContext context) {
        if (cuit == null || cuit.trim().isEmpty()) {
            return true; // Si el campo es null o vacío, lo consideramos válido
        }
        // Expresión regular para validar el formato: XX-XXXXXXXX-X
        return cuit.matches("^\\d{2}-\\d{8}-\\d{1}$");
    }
}

