package ar.edu.utn.frsf.sistemahotelero.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitacionEstadoResponse {
    private Integer numero;
    private Integer piso;
    private String descripcion;
    private String tipoHabitacion;  

    private List<DiaEstadoResponse> estadosPorDia;
}
