package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
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
    
    @Column(unique = true, nullable = false)
    private String cuit;
    
    private String razonSocial;
    
    private String telefono;
    
    @OneToOne
    private Direccion direccion;
}
