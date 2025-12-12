package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaDAO extends CrudRepository<Factura, Long> {

    boolean existsByResponsableDePagoId(Long responsableId);
}
