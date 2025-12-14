package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ResponsableDePagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.DireccionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.DireccionResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoRequestDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoResponseDTO;
import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;
import ar.edu.utn.frsf.sistemahotelero.model.Direccion;
import ar.edu.utn.frsf.sistemahotelero.model.Huesped;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaFisica;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaJuridica;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResponsableDePagoServiceImpl implements ResponsableDePagoService {

    private final ResponsableDePagoDAO responsableDAO;
    private final FacturaDAO facturaDAO;
    private final HuespedDAO huespedDAO;

    @Override
    @Transactional(readOnly = true)
    public List<ResponsablePagoResponseDTO> buscar(String razonSocial, String cuit) {
        String rs = normalize(razonSocial);
        String c = normalize(cuit);

        List<ResponsableDePago> encontrados;
        if (rs == null) {
            encontrados = StreamSupport
                    .stream(responsableDAO.findAll().spliterator(), false)
                    .collect(Collectors.toList());
        } else {
            encontrados = responsableDAO.buscarPorCriterios(rs);
        }

        List<ResponsablePagoResponseDTO> resultado = new ArrayList<>();
        for (ResponsableDePago r : encontrados) {
            if (c == null || matchesCuit(r, c)) {
                resultado.add(toResponse(r));
            }
        }
        return resultado;
    }

    @Override
    @Transactional
    public ResponsablePagoResponseDTO crear(ResponsablePagoRequestDTO request) {
        validarCuitUnicoSiCorresponde(request.getCuit(), null);

        ResponsableDePago guardado;
        // Si se informó CUIT, siempre lo tratamos como PJ (tercero o huésped con CUIT)
        if (request.getCuit() != null && !request.getCuit().isBlank()) {
            PersonaJuridica responsable = new PersonaJuridica();
            mapDatosBasicosJuridico(responsable, request);
            responsable.setDireccion(crearOactualizarDireccion(null, request.getDireccion()));
            guardado = responsableDAO.save(responsable);
        } else if (request.getHuespedTipoDoc() != null && request.getHuespedNroDoc() != null) {
            // Sin CUIT: PF (Consumidor Final) buscable por doc
            guardado = crearResponsableFisico(request);
        } else {
            throw new ReglaNegocioException("Debe indicar CUIT o tipo/nro de documento de huesped");
        }
        sincronizarCuitHuesped(request);
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public ResponsablePagoResponseDTO actualizar(Long id, ResponsablePagoRequestDTO request) {
        ResponsableDePago existente = responsableDAO.findById(id)
                .orElseThrow(() -> new ReglaNegocioException("Responsable de pago no encontrado"));

        validarCuitUnicoSiCorresponde(request.getCuit(), id);

        if (!(existente instanceof PersonaJuridica responsable)) {
            throw new ReglaNegocioException("Solo se admiten responsables juridicos para estos casos de uso");
        }

        mapDatosBasicosJuridico(responsable, request);
        Direccion direccion = crearOactualizarDireccion(responsable.getDireccion(), request.getDireccion());
        responsable.setDireccion(direccion);

        ResponsableDePago guardado = responsableDAO.save(responsable);
        sincronizarCuitHuesped(request);
        return toResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponsablePagoResponseDTO obtener(Long id) {
        ResponsableDePago responsable = responsableDAO.findById(id)
                .orElseThrow(() -> new ReglaNegocioException("Responsable de pago no encontrado"));
        return toResponse(responsable);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        ResponsableDePago responsable = responsableDAO.findById(id)
                .orElseThrow(() -> new ReglaNegocioException("Responsable de pago no encontrado"));

        if (facturaDAO.existsByResponsableDePagoId(id)) {
            throw new ReglaNegocioException("La firma no puede ser eliminada pues ya se confecciono una factura en el hotel.");
        }

        responsableDAO.delete(responsable);
    }

    private ResponsableDePago crearResponsableFisico(ResponsablePagoRequestDTO request) {
        HuespedId id = new HuespedId(request.getHuespedNroDoc(), request.getHuespedTipoDoc());
        Huesped huesped = huespedDAO.findById(id)
                .orElseThrow(() -> new ReglaNegocioException("No se encontro el huesped para asociar como responsable"));

        PersonaFisica pf = new PersonaFisica();
        pf.setNroDoc(huesped.getNroDoc());
        pf.setTipoDoc(huesped.getTipoDoc());
        pf.setHuesped(huesped);
        pf.setPosicionIVA(request.getPosicionIVA());
        pf.setNombreOrazonSocial(huesped.getApellido() + ", " + huesped.getNombre());

        return responsableDAO.save(pf);
    }

    private void mapDatosBasicosJuridico(PersonaJuridica responsable, ResponsablePagoRequestDTO request) {
        responsable.setCuit(request.getCuit());
        responsable.setPosicionIVA(request.getPosicionIVA());
        responsable.setRazonSocial(request.getRazonSocial());
        responsable.setNombreOrazonSocial(request.getRazonSocial());
        responsable.setTelefono(request.getTelefono());
    }

    private Direccion crearOactualizarDireccion(Direccion existente, DireccionRequest request) {
        Direccion dir = Optional.ofNullable(existente).orElseGet(Direccion::new);
        dir.setCalle(request.getCalle());
        dir.setNumero(request.getNumero());
        dir.setDepartamento(request.getDepartamento());
        dir.setPiso(request.getPiso());
        dir.setCodigoPostal(request.getCodigoPostal());
        dir.setLocalidad(request.getLocalidad());
        dir.setCiudad(request.getCiudad());
        dir.setProvincia(request.getProvincia());
        dir.setPais(request.getPais());
        return dir;
    }

    private ResponsablePagoResponseDTO toResponse(ResponsableDePago responsable) {
        ResponsablePagoResponseDTO dto = new ResponsablePagoResponseDTO();
        dto.setId(responsable.getId());
        dto.setCuit(responsable.getCuit());
        dto.setPosicionIVA(responsable.getPosicionIVA());
        dto.setRazonSocial(responsable.getNombreOrazonSocial());

        if (responsable instanceof PersonaJuridica pj) {
            dto.setTelefono(pj.getTelefono());
            if (pj.getDireccion() != null) {
                dto.setDireccion(toDireccionResponse(pj.getDireccion()));
            }
        }
        return dto;
    }

    private DireccionResponse toDireccionResponse(Direccion direccion) {
        DireccionResponse dto = new DireccionResponse();
        dto.setId(direccion.getId());
        dto.setCalle(direccion.getCalle());
        dto.setNumero(direccion.getNumero());
        dto.setDepartamento(direccion.getDepartamento());
        dto.setPiso(direccion.getPiso());
        dto.setCodigoPostal(direccion.getCodigoPostal());
        dto.setLocalidad(direccion.getLocalidad());
        dto.setCiudad(direccion.getCiudad());
        dto.setProvincia(direccion.getProvincia());
        dto.setPais(direccion.getPais());
        return dto;
    }

    private void validarCuitUnicoSiCorresponde(String cuit, Long idAExcluir) {
        if (cuit == null || cuit.isBlank()) return;

        String norm = normalizeCuit(cuit);

        boolean existePJ;
        if (idAExcluir == null) {
            existePJ = responsableDAO.existsByCuit(cuit)
                    || responsableDAO.findByCuitNormalized(norm).isPresent();
        } else {
            existePJ = responsableDAO.existsByCuitAndIdNot(cuit, idAExcluir)
                    || responsableDAO.findByCuitNormalized(norm)
                    .filter(r -> !r.getId().equals(idAExcluir))
                    .isPresent();
        }

        var optPF = responsableDAO.findPersonaFisicaByCuitNormalized(norm);
        boolean existePF = optPF.isPresent()
                && (idAExcluir == null || !optPF.get().getId().equals(idAExcluir));

        if (existePJ || existePF) {
            throw new ReglaNegocioException("El CUIT ya existe en el sistema");
        }
    }

    private void sincronizarCuitHuesped(ResponsablePagoRequestDTO request) {
        if (request.getHuespedTipoDoc() == null || request.getHuespedNroDoc() == null) return;
        HuespedId id = new HuespedId(request.getHuespedNroDoc(), request.getHuespedTipoDoc());
        huespedDAO.findById(id).ifPresent(h -> {
            h.setCuit(request.getCuit());
            // si el responsable tiene posicion IVA, aprovechamos y la propagamos
            if (request.getPosicionIVA() != null) {
                h.setPosicionIVA(request.getPosicionIVA());
            }
            huespedDAO.save(h);
        });
    }

    private String normalize(String valor) {
        if (valor == null) return null;
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeCuit(String cuit) {
        if (cuit == null) return "";
        return cuit.replaceAll("[^0-9]", "");
    }

    private boolean matchesCuit(ResponsableDePago responsable, String cuit) {
        if (cuit == null) return true;
        String norm = normalizeCuit(cuit);
        String rc = responsable.getCuit();
        if (rc == null) return false;
        return normalizeCuit(rc).contains(norm);
    }
}
