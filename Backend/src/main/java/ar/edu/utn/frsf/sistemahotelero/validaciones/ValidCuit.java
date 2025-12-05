package ar.edu.utn.frsf.sistemahotelero.validaciones;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Definir la anotación para validar el campo 'cuit'
@Constraint(validatedBy = CuitValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCuit {
    String message() default "El CUIT debe tener el formato XX-XXXXXXXX-X";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

