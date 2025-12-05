package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface HabitacionDAO extends CrudRepository<Habitacion, Long> {

    Optional<Habitacion> findByNumero(String numero);
    List<Habitacion> findByEstado(EstadoHabitacion estado);
    
    @Query("""
        SELECT h
        FROM Habitacion h
        ORDER BY h.numero
    """)
    List<Habitacion> findAllOrdenadas();
}