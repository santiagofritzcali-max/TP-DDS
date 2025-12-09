package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaDAO extends CrudRepository<Reserva, Long> {

    @Query("""
           select r from Reserva r
           where r.fechaInicio <= :hasta
           and r.fechaFin >= :desde
           """)
    List<Reserva> findReservasEnRango(@Param("desde") LocalDate desde,
                                      @Param("hasta") LocalDate hasta);
}
