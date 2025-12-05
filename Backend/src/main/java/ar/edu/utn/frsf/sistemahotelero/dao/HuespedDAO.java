package ar.edu.utn.frsf.sistemahotelero.dao;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HuespedDAO extends CrudRepository<Huesped, HuespedId> {

    @Query("SELECT h FROM Huesped h WHERE " +
            "(COALESCE(:apellido, '') = '' OR h.apellido LIKE %:apellido%) AND " +
            "(COALESCE(:nombre, '') = '' OR h.nombre LIKE %:nombre%) AND " +
            "(COALESCE(:nroDoc, '') = '' OR h.nroDoc = :nroDoc) AND " +
            "(COALESCE(:tipoDoc, '') = '' OR h.tipoDoc = :tipoDoc)")
    List<Huesped> buscarPorCriterios(String apellido, String nombre, String nroDoc, TipoDocumento tipoDoc);
}
