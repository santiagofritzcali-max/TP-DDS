package ar.edu.utn.frsf.sistemahotelero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class MedioPagoRequest {

    private TipoMedioPago tipo;

    private BigDecimal monto;

    // Moneda extranjera
    private String tipoMoneda;
    private BigDecimal cotizacion;

    // Tarjetas
    private String nombre;
    private String apellido;
    private Integer codigo;
    private String nroTarjeta;
    private LocalDate fechaVencimiento;
    private Integer cuotas; // solo credito

    // Cheque
    private String nroCheque;
    private String nombrePropietario;
    private String banco;
    private String plazo;
    private LocalDate fechaCobro;

    public enum TipoMedioPago {
        EFECTIVO,
        CHEQUE,
        MONEDA_EXTRANJERA,
        TARJETA_CREDITO,
        TARJETA_DEBITO
    }
}
