package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("Fisica")
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@IdClass(HuespedId.class)
public class PersonaFisica extends ResponsableDePago {
    
    @Id
    private String nroDoc; 

    @Id
    @Enumerated(EnumType.STRING)
    private TipoDocumento tipoDoc;  
    
    @OneToOne(optional = true)
     @JoinColumns({
        @JoinColumn(name = "nro_doc", referencedColumnName = "nro_doc", insertable = false, updatable = false),
        @JoinColumn(name = "tipo_doc", referencedColumnName = "tipo_doc", insertable = false, updatable = false)
    })
    private Huesped huesped;
}
