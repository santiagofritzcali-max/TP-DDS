package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.NotaCredito;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaCreditoDAO extends CrudRepository<NotaCredito, Long> {

    @Query("SELECT COALESCE(MAX(n.numero), 0) FROM NotaCredito n")
    Integer obtenerUltimoNumero();
}
