package ar.edu.utn.frsf.sistemahotelero.enums;

public enum TipoDocumento {
    DNI,
    LE,
    LC,
    Pasaporte,
    Otro;

    public static TipoDocumento parseOrNull(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;
        for (TipoDocumento td : values()) {
            if (td.name().equalsIgnoreCase(s)) return td; 
        }
        return null; 
    }
}
