package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ResponsableDePagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.DireccionRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.DireccionResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoRequestDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoResponseDTO;
import ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException;
import ar.edu.utn.frsf.sistemahotelero.model.Direccion;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaJuridica;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
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

    @Override
    @Transactional(readOnly = true)
    public List<ResponsablePagoResponseDTO> buscar(String razonSocial, String cuit) {
        String rs = normalize(razonSocial);
        String c = normalize(cuit);

        List<ResponsableDePago> encontrados;
        if (rs == null && c == null) {
            encontrados = StreamSupport
                    .stream(responsableDAO.findAll().spliterator(), false)
                    .collect(Collectors.toList());
        } else {
            encontrados = responsableDAO.buscarPorCriterios(rs, c);
        }

        List<ResponsablePagoResponseDTO> resultado = new ArrayList<>();
        for (ResponsableDePago r : encontrados) {
            resultado.add(toResponse(r));
        }
        return resultado;
    }

    @Override
    @Transactional
    public ResponsablePagoResponseDTO crear(ResponsablePagoRequestDTO request) {
        validarCuitUnico(request.getCuit(), null);

        PersonaJuridica responsable = new PersonaJuridica();
        mapDatosBasicos(responsable, request);
        responsable.setDireccion(crearOactualizarDireccion(null, request.getDireccion()));

        ResponsableDePago guardado = responsableDAO.save(responsable);
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public ResponsablePagoResponseDTO actualizar(Long id, ResponsablePagoRequestDTO request) {
        ResponsableDePago existente = responsableDAO.findById(id)
                .orElseThrow(() -> new ReglaNegocioException("Responsable de pago no encontrado"));

        validarCuitUnico(request.getCuit(), id);

        if (!(existente instanceof PersonaJuridica responsable)) {
            throw new ReglaNegocioException("Solo se admiten responsables juridicos para estos casos de uso");
        }

        mapDatosBasicos(responsable, request);
        Direccion direccion = crearOactualizarDireccion(responsable.getDireccion(), request.getDireccion());
        responsable.setDireccion(direccion);

        ResponsableDePago guardado = responsableDAO.save(responsable);
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

    private void mapDatosBasicos(PersonaJuridica responsable, ResponsablePagoRequestDTO request) {
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

    private void validarCuitUnico(String cuit, Long idAExcluir) {
        boolean existe;
        if (idAExcluir == null) {
            existe = responsableDAO.existsByCuit(cuit);
        } else {
            existe = responsableDAO.existsByCuitAndIdNot(cuit, idAExcluir);
        }
        if (existe) {
            throw new ReglaNegocioException("El CUIT ya existe en el sistema");
        }
    }

    private String normalize(String valor) {
        if (valor == null) return null;
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
