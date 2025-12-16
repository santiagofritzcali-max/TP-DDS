package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.NotaCreditoDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ResponsableDePagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.FacturaNotaCreditoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.NotaCreditoGeneradaDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarNotaCreditoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadiaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.NotaCredito;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GestorNotaCreditoImpl implements GestorNotaCredito {

    private final FacturaDAO facturaDAO;
    private final NotaCreditoDAO notaCreditoDAO;
    private final ResponsableDePagoDAO responsableDAO;
    private final HabitacionDAO habitacionDAO;

    @Autowired
    public GestorNotaCreditoImpl(FacturaDAO facturaDAO,
                                 NotaCreditoDAO notaCreditoDAO,
                                 ResponsableDePagoDAO responsableDAO,
                                 HabitacionDAO habitacionDAO) {
        this.facturaDAO = facturaDAO;
        this.notaCreditoDAO = notaCreditoDAO;
        this.responsableDAO = responsableDAO;
        this.habitacionDAO = habitacionDAO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacturaNotaCreditoDTO> listarFacturasPendientes(String cuit, TipoDocumento tipoDoc, String nroDoc) {
        ResponsableDePago responsable = buscarResponsable(cuit, tipoDoc, nroDoc);

        List<Factura> facturas = facturaDAO.findByResponsableDePagoIdAndEstadoAndNotaCreditoIsNull(
                responsable.getId(), FacturaEstado.PENDIENTE);

        List<FacturaNotaCreditoDTO> resultado = new ArrayList<>();
        for (Factura f : facturas) {
            resultado.add(toDto(f));
        }
        return resultado;
    }

    @Override
    @Transactional
    public NotaCreditoGeneradaDTO generarNotaCredito(RegistrarNotaCreditoRequest request) {
        if (request == null || request.getFacturaIds() == null || request.getFacturaIds().isEmpty()) {
            throw new IllegalArgumentException("Debe indicar al menos una factura a cancelar.");
        }

        ResponsableDePago responsable = buscarResponsable(request.getCuit(), request.getTipoDoc(), request.getNroDoc());

        List<Factura> facturas = new ArrayList<>();
        for (Long id : request.getFacturaIds()) {
            Factura f = facturaDAO.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada: " + id));
            if (!f.getResponsableDePago().getId().equals(responsable.getId())) {
                throw new IllegalArgumentException("La factura " + f.getNumero() + " no pertenece al responsable seleccionado.");
            }
            if (f.getEstado() != FacturaEstado.PENDIENTE) {
                throw new IllegalArgumentException("La factura " + f.getNumero() + " no está pendiente.");
            }
            facturas.add(f);
        }

        NotaCredito nota = new NotaCredito();
        nota.setFecha(new Date());
        nota.setNumero(generarNumero());
        nota.setFacturasCanceladas(facturas);

        NotaCredito guardada = notaCreditoDAO.save(nota);

        for (Factura f : facturas) {
            f.setNotaCredito(guardada);
            f.setEstado(FacturaEstado.CANCELADA);
            facturaDAO.save(f);
        }

        actualizarEstadoHabitacionSiCorresponde(facturas);

        BigDecimal total = facturas.stream()
                .map(Factura::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal iva = facturas.stream()
                .map(this::calcularIva)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal neto = total.subtract(iva);

        List<FacturaNotaCreditoDTO> factDtos = new ArrayList<>();
        for (Factura f : facturas) {
            factDtos.add(toDto(f));
        }

        return NotaCreditoGeneradaDTO.builder()
                .notaCreditoId(guardada.getIdNotaCredito())
                .numeroNotaCredito(guardada.getNumero())
                .fecha(toLocalDate(guardada.getFecha()))
                .responsable(responsable.getNombreOrazonSocial())
                .total(total)
                .iva(iva)
                .neto(neto)
                .facturas(factDtos)
                .build();
    }

    private ResponsableDePago buscarResponsable(String cuit, TipoDocumento tipoDoc, String nroDoc) {
        if (cuit != null && !cuit.isBlank()) {
            Optional<? extends ResponsableDePago> byCuit = responsableDAO.findByCuit(cuit);
            if (byCuit.isPresent()) return byCuit.get();
            String norm = cuit.replaceAll("[^0-9]", "");
            return responsableDAO.findPersonaFisicaByCuitNormalized(norm)
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró responsable con ese CUIT"));
        }
        if (tipoDoc != null && nroDoc != null && !nroDoc.isBlank()) {
            return responsableDAO.findByTipoDocAndNroDoc(tipoDoc, nroDoc)
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró responsable con ese documento"));
        }
        throw new IllegalArgumentException("Debe indicar CUIT o Tipo/Nro de documento");
    }

    private FacturaNotaCreditoDTO toDto(Factura f) {
        BigDecimal iva = calcularIva(f);
        return FacturaNotaCreditoDTO.builder()
                .facturaId(f.getIdFactura())
                .numeroFactura(f.getNumero())
                .fechaEmision(toLocalDate(f.getFechaEmision()))
                .tipoFactura(f.getTipo() != null ? f.getTipo().name() : null)
                .iva(iva)
                .total(f.getTotal())
                .neto(f.getTotal().subtract(iva))
                .build();
    }

    private BigDecimal calcularIva(Factura f) {
        if (f.getTipo() == TipoFact.A) {
            BigDecimal total = f.getTotal();
            BigDecimal divisor = BigDecimal.valueOf(1.21);
            BigDecimal neto = total.divide(divisor, 2, RoundingMode.HALF_UP);
            return total.subtract(neto);
        }
        return BigDecimal.ZERO;
    }

    private Integer generarNumero() {
        Integer ultimo = notaCreditoDAO.obtenerUltimoNumero();
        if (ultimo == null) ultimo = 0;
        return ultimo + 1;
    }

    private void actualizarEstadoHabitacionSiCorresponde(List<Factura> facturas) {
        if (facturas == null || facturas.isEmpty()) return;
        var factura = facturas.get(0);
        if (factura.getEstadia() == null || factura.getEstadia().getId() == null) return;

        Long estadiaId = factura.getEstadia().getId();
        boolean sinPendientes = !facturaDAO.existsByEstadiaIdAndEstado(estadiaId, FacturaEstado.PENDIENTE);

        if (sinPendientes && factura.getEstadia().getHabitacion() != null) {
            factura.getEstadia().setEstado(EstadiaEstado.FINALIZADA);
            Habitacion hab = factura.getEstadia().getHabitacion();
            hab.setEstado(EstadoHabitacion.Disponible);
            habitacionDAO.save(hab);
        }
    }

    private LocalDate toLocalDate(Date d) {
        if (d == null) return null;
        return d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }
}
