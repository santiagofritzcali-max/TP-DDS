package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.Servicio;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicioDAO extends CrudRepository<Servicio, Long> {

    List<Servicio> findByEstadiaId(Long estadiaId);
}

