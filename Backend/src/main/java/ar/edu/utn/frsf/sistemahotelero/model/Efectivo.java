package ar.edu.utn.frsf.sistemahotelero.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("Efectivo")  
public class Efectivo extends MedioPago {
}
