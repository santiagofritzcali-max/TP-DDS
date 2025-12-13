package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResponsableDePagoDAO extends CrudRepository<ResponsableDePago, Long> {

    Optional<ResponsableDePago> findByCuit(String cuit);

    boolean existsByCuit(String cuit);

    boolean existsByCuitAndIdNot(String cuit, Long id);

    @Query("""
            SELECT r
            FROM ResponsableDePago r
            WHERE (:razonSocial IS NULL OR LOWER(r.nombreOrazonSocial) LIKE LOWER(CONCAT('%', :razonSocial, '%')))
              AND (:cuit IS NULL OR r.cuit LIKE CONCAT('%', :cuit, '%'))
           """)
    List<ResponsableDePago> buscarPorCriterios(@Param("razonSocial") String razonSocial, @Param("cuit") String cuit);

    @Query("""
            SELECT r
            FROM ResponsableDePago r
            WHERE REPLACE(REPLACE(r.cuit, '-', ''), ' ', '') = :cuit
           """)
    Optional<ResponsableDePago> findByCuitNormalized(@Param("cuit") String cuit);

    @Query("""
            SELECT r
            FROM ResponsableDePago r
            WHERE r.tipoDoc = :tipoDoc
              AND r.nroDoc = :nroDoc
           """)
    Optional<ResponsableDePago> findByTipoDocAndNroDoc(@Param("tipoDoc") ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento tipoDoc,
                                                       @Param("nroDoc") String nroDoc);
}
