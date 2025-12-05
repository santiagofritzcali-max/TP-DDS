package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaDAO extends CrudRepository<Reserva, Long> {

    @Query("""
            SELECT r
            FROM Reserva r
            WHERE r.habitacion = :habitacion
              AND r.fechaInicio < :hasta
              AND r.fechaFin    > :desde
           """)
    List<Reserva> buscarPorHabitacionYRangoFechas(
            @Param("habitacion") Habitacion habitacion,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}

