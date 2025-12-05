package ar.edu.utn.frsf.sistemahotelero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcuparHabitacionRequest {

    @NotBlank
    private String numeroHabitacion;

    @NotNull
    private LocalDate fechaIngreso;

    @NotNull
    private LocalDate fechaEgreso;

    @Size(min = 1, message = "Debe seleccionar al menos un huésped")
    private List<Long> idsHuespedes;

    private boolean ocuparIgualSiReservada;
}
