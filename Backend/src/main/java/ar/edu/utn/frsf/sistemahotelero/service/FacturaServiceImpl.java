// service/impl/FacturaServiceImpl.java
package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.*;
import ar.edu.utn.frsf.sistemahotelero.dto.*;
import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import ar.edu.utn.frsf.sistemahotelero.excepciones.DatosBusquedaFacturacionException;
import ar.edu.utn.frsf.sistemahotelero.excepciones.PersonaMenorDeEdadException;
import ar.edu.utn.frsf.sistemahotelero.model.*;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HuespedId;
import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.util.FacturaFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FacturaServiceImpl implements FacturaService {

    private final EstadiaDAO estadiaDAO;
    private final ServicioDAO servicioDAO;
    private final FacturaDAO facturaDAO;
    private final HuespedDAO huespedDAO;
    private final ResponsableDePagoDAO responsableDAO;

    // -------- Paso 1-4: Buscar ocupantes --------

    @Override
    @Transactional(readOnly = true)
    public BuscarOcupantesResponseDTO buscarOcupantes(
            Integer numeroHabitacion,
            LocalDate fechaEgreso) {

        List<String> errores = new ArrayList<>();

        if (numeroHabitacion == null || numeroHabitacion <= 0) {
            errores.add("Numero de habitacion faltante o incorrecto.");
        }
        if (fechaEgreso == null) {
            errores.add("Fecha de salida faltante o incorrecta.");
        }

        if (!errores.isEmpty()) {
            throw new DatosBusquedaFacturacionException(errores);
        }

        Estadia estadia = estadiaDAO
                .findByHabitacionAndFechaDentroDelRango(numeroHabitacion, fechaEgreso)
                .or(() -> estadiaDAO.findByHabitacionAndFechaEgreso(numeroHabitacion, fechaEgreso))
                .orElseThrow(() -> new DatosBusquedaFacturacionException(
                        List.of("La habitacion indicada no se encuentra ocupada en la fecha de salida informada.")));

        BuscarOcupantesResponseDTO dto = new BuscarOcupantesResponseDTO();
        dto.setEstadiaId(estadia.getId());
        dto.setNumeroHabitacion(estadia.getHabitacion().getId().getNroHabitacion());
        dto.setFechaEgreso(estadia.getFechaEgreso());

        List<OcupanteDTO> ocupantesDto = new ArrayList<>();
        for (Huesped h : estadia.getHuespedes()) {
            OcupanteDTO o = new OcupanteDTO();
            o.setHuespedId(new HuespedIdDTO(h.getTipoDoc(), h.getNroDoc()));
            o.setNombreCompleto(h.getNombre() + " " + h.getApellido());
            o.setTipoDocumento(h.getTipoDoc().name());
            o.setNroDocumento(h.getNroDoc());
            o.setMayorDeEdad(esMayorDeEdad(h));
            ocupantesDto.add(o);
        }
        dto.setOcupantes(ocupantesDto);

        return dto;
    }

    // -------- Paso 5-6: Previsualizar factura --------

    @Override
    @Transactional(readOnly = true)
    public FacturaPreviewDTO prepararFactura(PrepararFacturaRequestDTO request) {

        Estadia estadia = estadiaDAO.findById(request.getEstadiaId())
                .orElseThrow(() -> new IllegalArgumentException("Estadia no encontrada"));

        ResponsableDePago responsable = obtenerResponsable(request);

        List<Servicio> servicios = servicioDAO.findByEstadiaId(estadia.getId());

        List<FacturaItemDTO> items = new ArrayList<>();

        // Item estadia
        FacturaItemDTO itemEstadia = new FacturaItemDTO();
        itemEstadia.setId("ESTADIA");
        itemEstadia.setDescripcion("Estadia Hab. " + estadia.getHabitacion().getId().getNroHabitacion());
        itemEstadia.setMonto(estadia.getHabitacion().getTarifa().doubleValue());
        itemEstadia.setTipo("ESTADIA");
        itemEstadia.setIncluido(true);
        items.add(itemEstadia);

        for (Servicio s : servicios) {
            FacturaItemDTO itemServ = new FacturaItemDTO();
            itemServ.setId("SERV-" + s.getId());
            itemServ.setDescripcion(s.getNombre());
            itemServ.setMonto(s.getCosto());
            itemServ.setTipo("SERVICIO");
            itemServ.setIncluido(true);
            items.add(itemServ);
        }

        double subtotal = items.stream()
                .mapToDouble(FacturaItemDTO::getMonto)
                .sum();

        TipoFact tipoFactura = FacturaFactory.calcularTipo(responsable);
        double iva = calcularIva(subtotal, tipoFactura);
        double total = subtotal + iva;

        FacturaPreviewDTO preview = new FacturaPreviewDTO();

        FacturaPreviewDTO.ResponsableDTO rDto = new FacturaPreviewDTO.ResponsableDTO();
        rDto.setId(responsable.getId());
        rDto.setNombreOrazonSocial(obtenerNombreResponsable(responsable));
        rDto.setCuit(obtenerCuitResponsable(responsable));
        PosicionIVA pos = obtenerPosicionIVA(responsable);
        rDto.setPosicionIVA(pos != null ? pos.name() : null);
        rDto.setTipoFactura(tipoFactura.name());

        preview.setResponsable(rDto);
        preview.setEstadiaId(estadia.getId());
        preview.setNumeroHabitacion(estadia.getHabitacion().getId().getNroHabitacion());
        preview.setFechaEgreso(estadia.getFechaEgreso());
        preview.setItems(items);
        preview.setSubtotal(subtotal);
        preview.setIva(iva);
        preview.setTotal(total);

        return preview;
    }

    // -------- Paso 7-8: Generar factura --------

    @Override
    @Transactional
    public FacturaGeneradaDTO generarFactura(CrearFacturaRequestDTO request) {

        Estadia estadia = estadiaDAO.findById(request.getEstadiaId())
                .orElseThrow(() -> new IllegalArgumentException("Estadia no encontrada"));

        ResponsableDePago responsable = responsableDAO.findById(request.getResponsableId())
                .orElseThrow(() -> new IllegalArgumentException("Responsable de pago no encontrado"));

        List<Servicio> servicios = servicioDAO.findByEstadiaId(estadia.getId());
        TipoFact tipoFactura = FacturaFactory.calcularTipo(responsable);

        double totalSeleccionado = calcularTotalSeleccionado(
                estadia, servicios, request.getIdsItemsSeleccionados(), tipoFactura);

        BigDecimal total = BigDecimal.valueOf(totalSeleccionado);

        // usamos la Factory con tu entidad Factura
        Factura factura = FacturaFactory.crearFactura(estadia, responsable, total);

        Factura guardada = facturaDAO.save(factura);

        FacturaGeneradaDTO dto = new FacturaGeneradaDTO();
        dto.setFacturaId(guardada.getIdFactura());
        dto.setNumero(guardada.getNumero());

        // Convertimos Date -> LocalDate para el DTO
        LocalDate fecha = guardada.getFechaEmision().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        dto.setFechaEmision(fecha);

        dto.setTipoFactura(guardada.getTipo().name());
        dto.setTotal(guardada.getTotal().doubleValue());
        dto.setEstadoPago(guardada.getPago() == null ? "PENDIENTE" : "PAGADA");

        return dto;
    }

    // -------- Helpers privados --------

    private boolean esMayorDeEdad(Huesped h) {
        if (h.getFechaNacimiento() == null) return true;
        return Period.between(h.getFechaNacimiento(), LocalDate.now()).getYears() >= 18;
    }

    private ResponsableDePago obtenerResponsable(PrepararFacturaRequestDTO request) {

        if (request.getCuitTercero() != null && !request.getCuitTercero().isBlank()) {
            return responsableDAO.findByCuit(request.getCuitTercero())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No se encontro un responsable de pago con ese CUIT"));
        }

        if (request.getHuespedResponsable() != null) {
            HuespedIdDTO hId = request.getHuespedResponsable();
            HuespedId id = new HuespedId(hId.getNroDoc(), hId.getTipoDoc());

            Huesped h = huespedDAO.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Huesped no encontrado"));

            if (!esMayorDeEdad(h)) {
                throw new PersonaMenorDeEdadException();
            }

            // Si tiene CUIT, buscamos por CUIT; si no, buscamos PF por doc (ConsumidorFinal)
            if (h.getCuit() != null && !h.getCuit().isBlank()) {
                String norm = normalizeCuit(h.getCuit());
                return responsableDAO.findByCuit(h.getCuit())
                        .or(() -> responsableDAO.findByCuitNormalized(norm))
                        .or(() -> responsableDAO.findByTipoDocAndNroDoc(h.getTipoDoc(), h.getNroDoc()))
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No se encontro Responsable de Pago para el huesped seleccionado"));
            } else {
                return responsableDAO.findByTipoDocAndNroDoc(h.getTipoDoc(), h.getNroDoc())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No se encontro Responsable de Pago para el huesped seleccionado"));
            }
        }

        throw new IllegalArgumentException("Debe indicar un huesped responsable o un CUIT de tercero");
    }

    private String normalizeCuit(String cuit) {
        if (cuit == null) return "";
        return cuit.replaceAll("[^0-9]", "");
    }

    private double calcularIva(double subtotal, TipoFact tipoFactura) {
        if (tipoFactura == TipoFact.A) {
            return subtotal * 0.21;
        }
        return 0.0;
    }

    private double calcularTotalSeleccionado(
            Estadia estadia,
            List<Servicio> servicios,
            List<String> idsSeleccionados,
            TipoFact tipoFactura) {

        double subtotal = 0.0;

        if (idsSeleccionados != null && idsSeleccionados.contains("ESTADIA")) {
            subtotal += estadia.getHabitacion().getTarifa().doubleValue();
        }

        if (idsSeleccionados != null) {
            for (Servicio s : servicios) {
                String id = "SERV-" + s.getId();
                if (idsSeleccionados.contains(id)) {
                    subtotal += s.getCosto();
                }
            }
        }

        return subtotal + calcularIva(subtotal, tipoFactura);
    }

    private PosicionIVA obtenerPosicionIVA(ResponsableDePago responsable) {
        if (responsable instanceof PersonaFisica pf && pf.getHuesped() != null) {
            return pf.getHuesped().getPosicionIVA();
        }
        if (responsable instanceof PersonaJuridica pj) {
            return pj.getPosicionIVA();
        }
        return responsable.getPosicionIVA();
    }

    private String obtenerCuitResponsable(ResponsableDePago responsable) {
        if (responsable instanceof PersonaFisica pf && pf.getHuesped() != null) {
            return pf.getHuesped().getCuit();
        }
        if (responsable instanceof PersonaJuridica pj) {
            return pj.getCuit();
        }
        return responsable.getCuit();
    }

    private String obtenerNombreResponsable(ResponsableDePago responsable) {
        if (responsable instanceof PersonaFisica pf && pf.getHuesped() != null) {
            Huesped h = pf.getHuesped();
            return h.getApellido() + ", " + h.getNombre();
        }
        if (responsable instanceof PersonaJuridica pj) {
            return pj.getRazonSocial();
        }
        return responsable.getNombreOrazonSocial();
    }
}
