package ar.edu.utn.frsf.sistemahotelero.enums;

public enum PosicionIVA {
    ConsumidorFinal,
    ResponsableInscripto,
    Monotributista,
    Exento,
    NoCorresponde;

    public static PosicionIVA parseOrNull(String s) {
        if (s == null) return null;
        s = s.trim();

        for (PosicionIVA p : values()) {
            if (p.name().equalsIgnoreCase(s)) return p;
        }

        return null; // si no coincide se trata como sin valor
    }
}
