package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EstadiaDAO extends CrudRepository<Estadia, Long> {

    @Query("""
           select e from Estadia e
           where e.fechaIngreso <= :hasta
           and e.fechaEgreso >= :desde
           """)
    List<Estadia> findEstadiasEnRango(@Param("desde") LocalDate desde,
                                      @Param("hasta") LocalDate hasta);
}
