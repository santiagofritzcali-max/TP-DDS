package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;

import ar.edu.utn.frsf.sistemahotelero.dto.*;

import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;

import ar.edu.utn.frsf.sistemahotelero.excepciones.HuespedDuplicadoException;
import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;

import ar.edu.utn.frsf.sistemahotelero.model.Direccion;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;

import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;

import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GestorHuespedImpl implements GestorHuesped {

    @Autowired
    private HuespedDAO huespedDAO;

    @Autowired
    private EstadiaDAO estadiaDAO;    
    
    // Obtener todos los huespedes
 /*   @Override
    public List<HuespedResponse> obtenerTodosLosHuespedes() {
        List<Huesped> huespedes = (List<Huesped>) huespedDAO.findAll();  // Llama al método CRUD para obtener todos los huespedes
        return huespedes.stream()
                .map(this::convertirAHuespedResponse)  // Convierte las entidades a DTOs
                .collect(Collectors.toList());
    }*/

    // Buscar huespedes por los criterios
    
    @Override
    public List<HuespedResponse> buscarPorCriterios(HuespedSearchRequest searchRequest) {
        List<Huesped> huespedes = huespedDAO.buscarPorCriterios(
            searchRequest.getApellido(),
            searchRequest.getNombre(),
            searchRequest.getNroDoc(),
            searchRequest.getTipoDoc()
        );

        // Si no se encuentran resultados (huespedes es null), devolvemos una lista vacía
        if (huespedes == null) {
            return Collections.emptyList();
        }

        // Convertimos las entidades Huesped a HuespedResponse (DTO)
        return huespedes.stream()
                .map(this::convertirAHuespedResponse)  // Convierte cada entidad a DTO
                .collect(Collectors.toList());  // Recoge los DTOs en una lista
    }



    // Método auxiliar para convertir la entidad Huesped a DTO
    private HuespedResponse convertirAHuespedResponse(Huesped huesped) {
        return new HuespedResponse(
                huesped.getApellido(),
                huesped.getNombre(),
                huesped.getTipoDoc(),
                huesped.getNroDoc(),
                huesped.getFechaNacimiento(),
                huesped.getTelefono(),
                huesped.getEmail(),
                huesped.getOcupacion(),
                huesped.getNacionalidad(),
                huesped.getCuit(),
                huesped.getPosicionIVA(),
                // Suponiendo que DireccionResponse tiene un constructor que acepta la entidad Direccion
                new DireccionResponse(huesped.getDireccion())
        );
    }

    @Override
    public HuespedResponse darAltaHuesped(HuespedRequest huespedRequest) {

        // 1) Construir la PK compuesta
        HuespedId id = new HuespedId(
                huespedRequest.getNroDoc(),
                huespedRequest.getTipoDoc()
        );

        boolean yaExiste = huespedDAO.existsById(id);

        // 2) Si ya existe y NO se autorizó a sobrescribir, lanzo excepción 409
        if (yaExiste && (huespedRequest.getAceptarDuplicado() == null
                || !huespedRequest.getAceptarDuplicado())) {
            throw new HuespedDuplicadoException(
                    huespedRequest.getTipoDoc(),
                    huespedRequest.getNroDoc()
            );
        }

        // 3) Mapear DTO -> entidad (nuevo estado del huésped)
        Huesped huesped = new Huesped(
                huespedRequest.getNroDoc(),
                huespedRequest.getTipoDoc(),
                huespedRequest.getApellido(),
                huespedRequest.getNombre(),
                huespedRequest.getFechaNacimiento(),
                huespedRequest.getTelefono(),
                huespedRequest.getEmail(),
                huespedRequest.getOcupacion(),
                huespedRequest.getNacionalidad(),
                huespedRequest.getCuit(),
                huespedRequest.getPosicionIVA(),
                new Direccion(huespedRequest.getDireccion())
        );

        // 4) Guardar
        Huesped huespedGuardado = huespedDAO.save(huesped);

        return new HuespedResponse(huespedGuardado);
    }
 
    @Override
    public HuespedResponse eliminarHuesped(String nroDoc, TipoDocumento tipoDoc) {

        // 1) Armar la PK compuesta
        HuespedId id = new HuespedId();
        id.setNroDoc(nroDoc);
        id.setTipoDoc(tipoDoc);

        // 2) Verificar que exista el huésped
        Huesped huesped = huespedDAO.findById(id)
                .orElseThrow(()
                    -> new ReglaNegocioException("No existe el huésped con documento " + tipoDoc + " " + nroDoc));

        // 3) Verificar que no tenga estadías
        boolean tieneEstadias = estadiaDAO.existeEstadiaConHuesped(nroDoc, tipoDoc);

        if (tieneEstadias) {
            throw new ReglaNegocioException(
                    "El huésped no puede ser eliminado pues se ha alojado en el Hotel en alguna oportunidad. Presione cualquier tecla para continuar."
            );
        }

        // 4) Eliminar
        huespedDAO.delete(huesped);

        return new HuespedResponse(huesped);
    }

    @Override
    public boolean puedeEliminar(String nroDoc, TipoDocumento tipoDoc) {
        HuespedId id = new HuespedId(nroDoc, tipoDoc);
        Huesped huesped = huespedDAO.findById(id)
                .orElseThrow(()
                        -> new ReglaNegocioException("No existe el huésped con documento " + tipoDoc + " " + nroDoc));

        boolean tieneEstadias = estadiaDAO.existeEstadiaConHuesped(nroDoc, tipoDoc);
        if (tieneEstadias) {
            throw new ReglaNegocioException(
                    "El huésped no puede ser eliminado pues se ha alojado en el Hotel en alguna oportunidad. Presione cualquier tecla para continuar."
            );
        }
        return true;
    }
    
    @Transactional
    @Override
    public HuespedResponse modificarHuesped(HuespedModificarRequest req) {

        // 1. Buscar huésped original por oldTipoDoc + oldNroDoc
        HuespedId idOriginal = new HuespedId(req.getOldNroDoc(), req.getOldTipoDoc());

        Huesped existente = huespedDAO.findById(idOriginal)
                .orElseThrow(()
                        -> new ReglaNegocioException("No se encontró el huésped a modificar"));

        // 2. Ver si el usuario cambió el documento
        boolean cambioDocumento
                = !req.getTipoDoc().equals(req.getOldTipoDoc())
                || !req.getNroDoc().equals(req.getOldNroDoc());

        // 3. Si cambió el documento → validar duplicación
        if (cambioDocumento) {

            HuespedId nuevoId = new HuespedId(req.getNroDoc(), req.getTipoDoc());

            boolean yaExiste = huespedDAO.existsById(nuevoId);

            if (yaExiste && !req.isAceptarDuplicado()) {
                throw new HuespedDuplicadoException(req.getTipoDoc(), req.getNroDoc());
            }
        }

        // 4. Actualizar datos personales
        existente.setApellido(req.getApellido());
        existente.setNombre(req.getNombre());
        /*existente.setTipoDoc(req.getTipoDoc());
        existente.setNroDoc(req.getNroDoc());*/
        existente.setCuit(req.getCuit());
        existente.setPosicionIVA(req.getPosicionIVA());
        existente.setFechaNacimiento(req.getFechaNacimiento());
        existente.setTelefono(req.getTelefono());
        existente.setEmail(req.getEmail());
        existente.setOcupacion(req.getOcupacion());
        existente.setNacionalidad(req.getNacionalidad());

        // 5. Actualizar dirección
        DireccionRequest dirReq = req.getDireccion();
        if (dirReq != null) {
            Direccion dir = existente.getDireccion();
            if (dir == null) {
                dir = new Direccion();
                existente.setDireccion(dir);
            }

            dir.setCalle(dirReq.getCalle());
            dir.setNumero(dirReq.getNumero());
            dir.setDepartamento(dirReq.getDepartamento());
            dir.setPiso(dirReq.getPiso());
            dir.setCodigoPostal(dirReq.getCodigoPostal());
            dir.setLocalidad(dirReq.getLocalidad());
            dir.setProvincia(dirReq.getProvincia());
            dir.setPais(dirReq.getPais());
            dir.setCiudad(dirReq.getCiudad());
        }

        // 6. Guardar
        Huesped guardado = huespedDAO.save(existente);
        
        // Si cambió tipo/nro de documento, actualizamos la PK vía UPDATE directo
        if (cambioDocumento) {
            huespedDAO.actualizarDocumento(
                    req.getOldTipoDoc(),
                    req.getOldNroDoc(),
                    req.getTipoDoc(),
                    req.getNroDoc()
            );
        }

        // 7. Devolver DTO
        HuespedResponse resp = convertirAHuespedResponse(guardado);
        
        resp.setTipoDoc(req.getTipoDoc());
        resp.setNroDoc(req.getNroDoc());
        return resp;
    }
}
