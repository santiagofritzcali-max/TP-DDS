package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("Juridica")
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PersonaJuridica extends ResponsableDePago {
    
    @Id
    private String cuit;
    
    private String razonSocial;
    
    private String telefono;
    
    @OneToOne
    private Direccion direccion;
}
