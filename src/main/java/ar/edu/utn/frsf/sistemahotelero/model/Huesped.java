package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "G17_huesped")
@IdClass(HuespedId.class)  // Definimos HuespedId como la clave primaria compuesta
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Huesped {

    @Id
    @Column(name = "nro_doc")
    private String nroDoc;  // Primer campo de la clave primaria

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_doc")
    private TipoDocumento tipoDoc;  // Segundo campo de la clave primaria

    @NotBlank
    @Size(max = 50)
    private String apellido;

    @NotBlank
    @Size(max = 50)
    private String nombre;

    @Past
    private LocalDate fechaNacimiento;

    @Size(max = 20)
    private String telefono;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 100)
    private String ocupacion;

    @Size(max = 50)
    private String nacionalidad;

    @Size(max = 20)
    private String cuit;

    @Enumerated(EnumType.STRING)
    private PosicionIVA posicionIVA;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(name = "direccion_id", referencedColumnName = "id")
    private Direccion direccion;

}
