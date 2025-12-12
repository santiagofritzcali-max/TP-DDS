package ar.edu.utn.frsf.sistemahotelero.dto;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import java.time.LocalDate;
import lombok.Data;

@Data
public class HuespedModificarRequest {

    private TipoDocumento oldTipoDoc;
    private String oldNroDoc;

    private String nombre;
    private String apellido;
    private TipoDocumento tipoDoc;
    private String nroDoc;
    private String cuit;
    private PosicionIVA posicionIVA;
    private LocalDate fechaNacimiento;
    private String telefono;
    private String email;
    private String ocupacion;
    private String nacionalidad;

    private DireccionRequest direccion;

    private boolean aceptarDuplicado = false;
}

