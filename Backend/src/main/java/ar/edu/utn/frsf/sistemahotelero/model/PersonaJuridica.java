package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "G17_persona_juridica")
@PrimaryKeyJoinColumn(name = "id")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "direccion")
public class PersonaJuridica extends ResponsableDePago {

    @Column(name = "cuit", unique = true)
    private String cuit;

    @Column(name = "razon_social", nullable = true)
    private String razonSocial;

    private String telefono;
    
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "direccion_id", referencedColumnName = "id")
    private Direccion direccion;

    @Override
    public String getNombreOrazonSocial() {
        return razonSocial;
    }

    @PrePersist
    @PreUpdate
    private void sincronizarNombre() {
        this.setNombreOrazonSocial(razonSocial);
    }
}
