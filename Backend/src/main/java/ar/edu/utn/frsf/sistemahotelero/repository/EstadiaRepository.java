public interface EstadiaRepository extends JpaRepository<Estadia, Long> {
  @Query("""
    select e from Estadia e
    where e.fechaIngreso <= :hasta and e.fechaEgreso >= :desde
  """)
  List<Estadia> findSolapadas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
