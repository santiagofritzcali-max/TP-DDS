public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
  @Query("select h from Habitacion h order by h.tipoHabitacion, h.numero")
  List<Habitacion> findAllOrdenadas();
}
