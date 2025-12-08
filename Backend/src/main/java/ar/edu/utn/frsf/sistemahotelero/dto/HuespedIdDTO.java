package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HuespedIdDTO {

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDoc;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20)
    private String nroDoc;
}
