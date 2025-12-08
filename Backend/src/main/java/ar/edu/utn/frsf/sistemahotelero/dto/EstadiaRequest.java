package ar.edu.utn.frsf.sistemahotelero.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadiaRequest {

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    @NotNull(message = "La fecha de egreso es obligatoria")
    private LocalDate fechaEgreso;

    @NotNull(message = "El número de piso es obligatorio")
    private Integer nroPiso;

    @NotNull(message = "El número de habitación es obligatorio")
    private Integer nroHabitacion;

    private String reservaId;

    @Size(min = 1, message = "Debe asociar al menos un huésped")
    private List<HuespedIdDTO> huespedes;
}
