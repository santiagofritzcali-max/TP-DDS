package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@DiscriminatorValue("Fisica")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "huesped")
public class PersonaFisica extends ResponsableDePago {
    
    @Column(name = "nro_doc")
    private String nroDoc;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_doc")
    private TipoDocumento tipoDoc;
    
    @OneToOne(optional = true)
    @JoinColumns({
        @JoinColumn(name = "nro_doc", referencedColumnName = "nro_doc", insertable = false, updatable = false),
        @JoinColumn(name = "tipo_doc", referencedColumnName = "tipo_doc", insertable = false, updatable = false)
    })
    private Huesped huesped;

    @Override
    public String getCuit() {
        return huesped != null ? huesped.getCuit() : null;
    }

    @Override
    public PosicionIVA getPosicionIVA() {
        return huesped != null ? huesped.getPosicionIVA() : null;
    }

    @Override
    public String getNombreOrazonSocial() {
        if (huesped == null) return null;
        return huesped.getApellido() + ", " + huesped.getNombre();
    }

    @PrePersist
    @PreUpdate
    private void sincronizarDatosResponsable() {
        if (huesped != null) {
            this.setCuit(huesped.getCuit());
            this.setPosicionIVA(huesped.getPosicionIVA());
            this.setNombreOrazonSocial(getNombreOrazonSocial());
        }
    }
}
