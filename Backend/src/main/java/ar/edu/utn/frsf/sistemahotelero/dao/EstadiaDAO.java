package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadiaDAO extends CrudRepository<Estadia, Long> {

    @Query("""
            SELECT e
            FROM Estadia e
            WHERE e.habitacion = :habitacion
              AND e.fechaIngreso < :hasta
              AND e.fechaEgreso  > :desde
           """)
    List<Estadia> buscarPorHabitacionYRangoFechas(
            @Param("habitacion") Habitacion habitacion,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
    
        @Query("""
            SELECT e
            FROM Estadia e
            WHERE e.fechaIngreso < :hasta
              AND e.fechaEgreso  > :desde
           """)
        
        List<Estadia> findSolapadas(
                @Param("desde") LocalDate desde, 
                @Param("hasta") LocalDate hasta);
        
    @Query("""
            SELECT e
            FROM Estadia e
            WHERE e.habitacion.id.nroHabitacion = :numeroHabitacion
              AND e.fechaEgreso = :fechaEgreso
           """)
    Optional<Estadia> findByHabitacionAndFechaEgreso(
            @Param("numeroHabitacion") Integer numeroHabitacion,
            @Param("fechaEgreso") LocalDate fechaEgreso);
    
    
    @Query("""
           SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
           FROM Estadia e
             JOIN e.huespedes h
           WHERE h.nroDoc = :nroDoc
             AND h.tipoDoc = :tipoDoc
           """)
    boolean existeEstadiaConHuesped(
            @Param("nroDoc") String nroDoc,
            @Param("tipoDoc") TipoDocumento tipoDoc);
}
