package ar.edu.utn.frsf.sistemahotelero.validaciones;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = PisoValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)

public @interface ValidPiso {
    String message() default "El piso debe contener solo números";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
