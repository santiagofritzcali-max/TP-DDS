// util/FacturaFactory.java
package ar.edu.utn.frsf.sistemahotelero.util;

import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaFisica;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaJuridica;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import java.math.BigDecimal;
import java.util.Date;

public class FacturaFactory {

    private FacturaFactory() { }

    /**
     * Crea una nueva factura lista para persistir.
     * - fechaEmision = ahora
     * - tipo = A/B según la posición IVA del responsable
     * - total = total ya calculado
     * - numero = correlativo calculado afuera
     */
    public static Factura crearFactura(
            Estadia estadia,
            ResponsableDePago responsable,
            BigDecimal total,
            Integer numero) {

        Factura f = new Factura();
        f.setFechaEmision(new Date());
        f.setEstadia(estadia);
        f.setResponsableDePago(responsable);
        f.setTipo(calcularTipo(responsable));
        f.setTotal(total);
        f.setNumero(numero);
        return f;
    }

    /**
     * Separa la lógica de cómo se decide el tipo A/B
     * según la posición frente al IVA del responsable.
     */
    public static TipoFact calcularTipo(ResponsableDePago responsable) {
        PosicionIVA pos = null;
        if (responsable instanceof PersonaFisica pf && pf.getHuesped() != null) {
            pos = pf.getHuesped().getPosicionIVA();
        } else if (responsable instanceof PersonaJuridica pj) {
            pos = pj.getPosicionIVA();
        } else {
            pos = responsable.getPosicionIVA();
        }

        if (pos == PosicionIVA.ResponsableInscripto) return TipoFact.A;
        return TipoFact.B;
    }
}
