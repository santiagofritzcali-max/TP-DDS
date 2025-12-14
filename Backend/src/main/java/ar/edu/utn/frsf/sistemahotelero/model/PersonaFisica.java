package ar.edu.utn.frsf.sistemahotelero.model;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "G17_persona_fisica")
@PrimaryKeyJoinColumn(name = "id")
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
        if (huesped != null && huesped.getCuit() != null) {
            return huesped.getCuit();
        }
        return null;
    }

    @Override
    public PosicionIVA getPosicionIVA() {
        if (huesped != null && huesped.getPosicionIVA() != null) {
            return huesped.getPosicionIVA();
        }
        return super.getPosicionIVA();
    }

    @Override
    public String getNombreOrazonSocial() {
        if (huesped != null) {
            return huesped.getApellido() + ", " + huesped.getNombre();
        }
        return super.getNombreOrazonSocial();
    }

    @PrePersist
    @PreUpdate
    private void sincronizarDatosResponsable() {
        if (huesped != null) {
            this.setPosicionIVA(huesped.getPosicionIVA());
            this.setNombreOrazonSocial(getNombreOrazonSocial());
        }
    }
}
