package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitacionDAO extends CrudRepository<Habitacion, Long> {

    Optional<Habitacion> findByNumero(Integer numero);
}

