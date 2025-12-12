package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoRequestDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.ResponsablePagoResponseDTO;
import java.util.List;

public interface ResponsableDePagoService {

    List<ResponsablePagoResponseDTO> buscar(String razonSocial, String cuit);

    ResponsablePagoResponseDTO crear(ResponsablePagoRequestDTO request);

    ResponsablePagoResponseDTO actualizar(Long id, ResponsablePagoRequestDTO request);

    ResponsablePagoResponseDTO obtener(Long id);

    void eliminar(Long id);
}

