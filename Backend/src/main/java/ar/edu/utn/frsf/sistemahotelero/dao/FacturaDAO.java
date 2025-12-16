package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaDAO extends CrudRepository<Factura, Long> {

    boolean existsByResponsableDePagoId(Long responsableId);

    List<Factura> findByEstadiaHabitacionIdNroHabitacionAndEstado(Integer numeroHabitacion, FacturaEstado estado);

    List<Factura> findByResponsableDePagoIdAndEstadoAndNotaCreditoIsNull(Long responsableId, FacturaEstado estado);

    boolean existsByEstadiaIdAndEstado(Long estadiaId, FacturaEstado estado);

    @Query("SELECT COALESCE(MAX(f.numero), 0) FROM Factura f")
    Integer obtenerUltimoNumero();
}
