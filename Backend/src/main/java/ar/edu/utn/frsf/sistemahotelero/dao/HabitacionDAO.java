package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabitacionDAO extends JpaRepository<Habitacion, HabitacionId> {

  List<Habitacion> findByEstado(EstadoHabitacion estado);

  @Query("select h from Habitacion h order by h.id.nroPiso, h.id.nroHabitacion")
  List<Habitacion> findAllOrdenadas();

  Optional<Habitacion> findByIdNroPisoAndIdNroHabitacion(Integer nroPiso, Integer nroHabitacion);
}
