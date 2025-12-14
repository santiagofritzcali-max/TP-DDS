package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaFisica;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaJuridica;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResponsableDePagoDAO extends CrudRepository<ResponsableDePago, Long> {

    @Query("""
            SELECT r
            FROM ResponsableDePago r
            WHERE (:razonSocial IS NULL OR LOWER(r.nombreOrazonSocial) LIKE LOWER(CONCAT('%', :razonSocial, '%')))
           """)
    List<ResponsableDePago> buscarPorCriterios(@Param("razonSocial") String razonSocial);

    @Query("""
            SELECT pj
            FROM PersonaJuridica pj
            WHERE pj.cuit = :cuit
           """)
    Optional<PersonaJuridica> findByCuit(@Param("cuit") String cuit);

    @Query("""
            SELECT CASE WHEN COUNT(pj) > 0 THEN true ELSE false END
            FROM PersonaJuridica pj
            WHERE pj.cuit = :cuit
           """)
    boolean existsByCuit(@Param("cuit") String cuit);

    @Query("""
            SELECT CASE WHEN COUNT(pj) > 0 THEN true ELSE false END
            FROM PersonaJuridica pj
            WHERE pj.cuit = :cuit AND pj.id <> :id
           """)
    boolean existsByCuitAndIdNot(@Param("cuit") String cuit, @Param("id") Long id);

    @Query("""
            SELECT pj
            FROM PersonaJuridica pj
            WHERE REPLACE(REPLACE(pj.cuit, '-', ''), ' ', '') = :cuit
           """)
    Optional<PersonaJuridica> findByCuitNormalized(@Param("cuit") String cuit);

    @Query("""
            SELECT pf
            FROM PersonaFisica pf
            WHERE pf.tipoDoc = :tipoDoc
              AND pf.nroDoc = :nroDoc
           """)
    Optional<PersonaFisica> findByTipoDocAndNroDoc(@Param("tipoDoc") TipoDocumento tipoDoc,
                                                   @Param("nroDoc") String nroDoc);

    @Query("""
            SELECT pf
            FROM PersonaFisica pf
            JOIN pf.huesped h
            WHERE REPLACE(REPLACE(h.cuit, '-', ''), ' ', '') = :cuit
           """)
    Optional<PersonaFisica> findPersonaFisicaByCuitNormalized(@Param("cuit") String cuit);
}
