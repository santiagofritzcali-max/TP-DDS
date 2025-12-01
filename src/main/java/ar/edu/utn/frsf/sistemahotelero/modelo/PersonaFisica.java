package ar.edu.utn.frsf.sistemahotelero.modelo;

public class PersonaFisica extends ResponsableDePago {
    private Huesped huesped;

    public Huesped getHuesped() {
        return huesped;
    }

    public void setHuesped(Huesped huesped) {
        this.huesped = huesped;
    }
}
