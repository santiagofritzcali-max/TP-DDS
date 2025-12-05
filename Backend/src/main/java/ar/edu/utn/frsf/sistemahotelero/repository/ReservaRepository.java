public interface ReservaRepository extends JpaRepository<Reserva, Long> {
  @Query("""
    select r from Reserva r
    where r.fechaInicio <= :hasta and r.fechaFin >= :desde
  """)
  List<Reserva> findSolapadas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
