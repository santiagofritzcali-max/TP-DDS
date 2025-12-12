package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@DiscriminatorValue("Juridica")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "direccion")
public class PersonaJuridica extends ResponsableDePago {

    @Column(nullable = false)
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
