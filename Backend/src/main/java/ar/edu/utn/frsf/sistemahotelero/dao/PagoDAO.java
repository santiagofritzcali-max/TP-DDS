package ar.edu.utn.frsf.sistemahotelero.dao; 

import ar.edu.utn.frsf.sistemahotelero.model.Pago;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoDAO extends CrudRepository<Pago, Long> {
}
