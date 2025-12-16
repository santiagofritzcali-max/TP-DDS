package ar.edu.utn.frsf.sistemahotelero.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadiaOcuparResponse {

    private Long estadiaId;
    
    private Integer nroPiso;
    private Integer nroHabitacion; 
    
    private LocalDate fechaIngreso;
    private LocalDate fechaEgreso;
    
    private String mensaje;

    /**
     * Se setea en true cuando la habitación está reservada en el rango solicitado
     * y el front debe pedir confirmación antes de ocupar igualmente.
     */
    private boolean requiereConfirmacion;

    /**
     * Datos básicos de la reserva encontrada, para mostrar en el popup de advertencia.
     */
    private ReservaInfo reservaInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReservaInfo {
        private Long id;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;
        private String nombre;
        private String apellido;
        private String telefono;
    }
}
