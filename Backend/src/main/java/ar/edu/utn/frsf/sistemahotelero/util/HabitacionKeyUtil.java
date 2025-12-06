package ar.edu.utn.frsf.sistemahotelero.util;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;

public final class HabitacionKeyUtil {
    private HabitacionKeyUtil() {}

    /**
     * Formato recomendado: "piso-habitacion" (ej: "3-12")
     * También acepta "piso/habitacion" o "piso:habitacion".
     * Si viene solo dígitos (ej "312"), asume: piso=3, habitacion=12 (últimos 2 dígitos).
     * @param key
     * @return 
     */
    public static HabitacionId parse(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Habitación inválida. Use formato 'piso-habitacion' ej: 3-12");
        }
        String k = key.trim();

        String[] parts = k.split("[-/:]");
        if (parts.length == 2) {
            return new HabitacionId(
                    Integer.valueOf(parts[0].trim()),
                    Integer.valueOf(parts[1].trim())
            );
        }

        // fallback: "312" => piso=3, habitacion=12 (últimos 2 dígitos)
        if (k.matches("\\d+")) {
            if (k.length() < 3) {
                throw new IllegalArgumentException("Habitación inválida. Use 'piso-habitacion' ej: 3-12");
            }
            int piso = Integer.parseInt(k.substring(0, k.length() - 2));
            int hab  = Integer.parseInt(k.substring(k.length() - 2));
            return new HabitacionId(piso, hab);
        }

        throw new IllegalArgumentException("Habitación inválida. Use formato 'piso-habitacion' ej: 3-12");
    }
}
