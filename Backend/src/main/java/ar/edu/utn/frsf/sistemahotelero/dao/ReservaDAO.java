package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.ReservaEstado;
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
              AND r.estado = :estado
              AND r.fechaInicio < :hasta
              AND r.fechaFin    > :desde
           """)
    List<Reserva> buscarPorHabitacionYRangoFechas(
            @Param("habitacion") Habitacion habitacion,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta,
            @Param("estado") ReservaEstado estado
    );
    
    @Query("""
            SELECT r
            FROM Reserva r
            WHERE r.estado = :estado
              AND r.fechaInicio < :hasta
              AND r.fechaFin    > :desde
           """)
    List<Reserva> findSolapadas(
                @Param("desde") LocalDate desde, 
                @Param("hasta") LocalDate hasta,
                @Param("estado") ReservaEstado estado);
    
    // CU06 - CANCELAR RESERVA
    
    @Query("""
            SELECT r
            FROM Reserva r
            WHERE LOWER(r.apellido) LIKE LOWER(CONCAT(:apellido, '%'))
              AND r.estado = :estado
            ORDER BY r.apellido, r.nombre, r.fechaInicio
           """)
    List<Reserva> buscarPorApellido(@Param("apellido") String apellido, @Param("estado") ReservaEstado estado);
    
     @Query("""
            SELECT r
            FROM Reserva r
            WHERE LOWER(r.apellido) LIKE LOWER(CONCAT(:apellido, '%'))
              AND LOWER(r.nombre)  LIKE LOWER(CONCAT(:nombre,  '%'))
              AND r.estado = :estado
            ORDER BY r.apellido, r.nombre, r.fechaInicio
           """)
    List<Reserva> buscarPorApellidoYNombre(@Param("apellido") String apellido,@Param("nombre") String nombre, @Param("estado") ReservaEstado estado);
    
}
