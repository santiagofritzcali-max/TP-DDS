package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.PagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.FacturaPendienteDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.MedioPagoRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.PagoRegistradoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarPagoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.model.Cheque;
import ar.edu.utn.frsf.sistemahotelero.model.Efectivo;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.MedioPago;
import ar.edu.utn.frsf.sistemahotelero.model.MonedaExtranjera;
import ar.edu.utn.frsf.sistemahotelero.model.Pago;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import ar.edu.utn.frsf.sistemahotelero.model.Tarjeta;
import ar.edu.utn.frsf.sistemahotelero.model.TarjetaCredito;
import ar.edu.utn.frsf.sistemahotelero.model.TarjetaDebito;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GestorPagoImpl implements GestorPago {

    private final FacturaDAO facturaDAO;
    private final PagoDAO pagoDAO;
    private final HabitacionDAO habitacionDAO;

    @Autowired
    public GestorPagoImpl(FacturaDAO facturaDAO, PagoDAO pagoDAO, HabitacionDAO habitacionDAO) {
        this.facturaDAO = facturaDAO;
        this.pagoDAO = pagoDAO;
        this.habitacionDAO = habitacionDAO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacturaPendienteDTO> listarFacturasPendientes(Integer numeroHabitacion) {
        if (numeroHabitacion == null || numeroHabitacion <= 0) {
            throw new IllegalArgumentException("Numero de habitacion faltante o incorrecto.");
        }

        List<Factura> facturas = facturaDAO
                .findByEstadiaHabitacionIdNroHabitacionAndEstado(numeroHabitacion, FacturaEstado.PENDIENTE);

        List<FacturaPendienteDTO> resultado = new ArrayList<>();
        for (Factura f : facturas) {
            FacturaPendienteDTO dto = new FacturaPendienteDTO();
            dto.setFacturaId(f.getIdFactura());
            dto.setNumeroFactura(f.getNumero());
            dto.setFechaEmision(toLocalDate(f.getFechaEmision()));
            dto.setTotal(f.getTotal());
            dto.setTipoFactura(f.getTipo() != null ? f.getTipo().name() : null);
            dto.setEstadoPago("PENDIENTE");
            dto.setResponsable(nombreResponsable(f.getResponsableDePago()));
            dto.setNumeroHabitacion(numeroHabitacion); // ya proviene del filtro
            resultado.add(dto);
        }
        return resultado;
    }

    @Override
    @Transactional
    public PagoRegistradoDTO registrarPago(RegistrarPagoRequest request) {
        if (request == null || request.getFacturaId() == null) {
            throw new IllegalArgumentException("Debe indicar la factura a pagar.");
        }

        Factura factura = facturaDAO.findById(request.getFacturaId())
                .orElseThrow(() -> new IllegalArgumentException("Factura no encontrada"));

        if (factura.getEstado() != FacturaEstado.PENDIENTE) {
            throw new IllegalStateException("La factura no está pendiente de pago.");
        }

        List<MedioPagoRequest> mediosRequest = request.getMedios();
        if (mediosRequest == null || mediosRequest.isEmpty()) {
            throw new IllegalArgumentException("Debe indicar al menos un medio de pago.");
        }

        Pago pago = new Pago();
        pago.setFecha(new Date());

        List<MedioPago> medios = new ArrayList<>();
        BigDecimal totalAplicado = BigDecimal.ZERO;

        for (MedioPagoRequest mpReq : mediosRequest) {
            validarMedioPago(mpReq);
            BigDecimal aplicado = calcularMontoAplicado(mpReq);
            MedioPago medio = construirMedio(mpReq);
            medio.setMonto(aplicado);
            medio.setPago(pago);
            medios.add(medio);
            totalAplicado = totalAplicado.add(aplicado);
        }

        if (factura.getTotal() == null) {
            throw new IllegalStateException("La factura no tiene total asignado.");
        }

        if (totalAplicado.compareTo(factura.getTotal()) < 0) {
            throw new IllegalArgumentException("El monto abonado es menor al total de la factura.");
        }

        pago.setMonto(totalAplicado);
        pago.setMediosDePago(medios);

        pago = pagoDAO.save(pago);

        factura.setPago(pago);
        factura.setEstado(FacturaEstado.PAGADA);
        facturaDAO.save(factura);

        actualizarEstadoHabitacion(factura);

        BigDecimal vuelto = totalAplicado.subtract(factura.getTotal());
        if (vuelto.compareTo(BigDecimal.ZERO) < 0) {
            vuelto = BigDecimal.ZERO;
        }

        PagoRegistradoDTO dto = new PagoRegistradoDTO();
        dto.setPagoId(pago.getIdPago());
        dto.setFacturaId(factura.getIdFactura());
        dto.setNumeroFactura(factura.getNumero());
        dto.setFechaPago(toLocalDate(pago.getFecha()));
        dto.setTotalFactura(factura.getTotal());
        dto.setMontoPagado(totalAplicado);
        dto.setVuelto(vuelto);
        dto.setEstadoFactura("PAGADA");
        dto.setNumeroHabitacion(
                factura.getEstadia() != null && factura.getEstadia().getHabitacion() != null
                        ? factura.getEstadia().getHabitacion().getId().getNroHabitacion()
                        : null
        );

        return dto;
    }

    private void actualizarEstadoHabitacion(Factura factura) {
        Estadia estadia = factura.getEstadia();
        if (estadia == null || estadia.getHabitacion() == null) {
            return;
        }
        boolean sinPendientes = estadia.getId() != null
                && !facturaDAO.existsByEstadiaIdAndEstado(estadia.getId(), FacturaEstado.PENDIENTE);

        if (sinPendientes) {
            estadia.setEstado(ar.edu.utn.frsf.sistemahotelero.enums.EstadiaEstado.FINALIZADA);
            Habitacion habitacion = estadia.getHabitacion();
            habitacion.setEstado(EstadoHabitacion.Disponible);
            habitacionDAO.save(habitacion);
        }
    }

    private String nombreResponsable(ResponsableDePago responsable) {
        if (responsable == null) return null;
        return responsable.getNombreOrazonSocial();
    }

    private BigDecimal calcularMontoAplicado(MedioPagoRequest request) {
        BigDecimal monto = valorNoNulo(request.getMonto());
        if (request.getTipo() == MedioPagoRequest.TipoMedioPago.MONEDA_EXTRANJERA) {
            BigDecimal cot = valorNoNulo(request.getCotizacion(), BigDecimal.ONE);
            return monto.multiply(cot);
        }
        return monto;
    }

    private MedioPago construirMedio(MedioPagoRequest request) {
        return switch (request.getTipo()) {
            case EFECTIVO -> new Efectivo();
            case CHEQUE -> construirCheque(request);
            case MONEDA_EXTRANJERA -> construirMonedaExtranjera(request);
            case TARJETA_CREDITO -> construirTarjetaCredito(request);
            case TARJETA_DEBITO -> construirTarjetaDebito(request);
        };
    }

    private Cheque construirCheque(MedioPagoRequest request) {
        Cheque c = new Cheque();
        c.setBanco(request.getBanco());
        c.setNroCheque(request.getNroCheque());
        c.setNombrePropietario(request.getNombrePropietario());
        c.setPlazo(request.getPlazo());
        c.setFechaCobro(toDate(request.getFechaCobro()));
        return c;
    }

    private MonedaExtranjera construirMonedaExtranjera(MedioPagoRequest request) {
        MonedaExtranjera m = new MonedaExtranjera();
        m.setTipoMoneda(request.getTipoMoneda());
        m.setCotizacion(request.getCotizacion());
        return m;
    }

    private TarjetaCredito construirTarjetaCredito(MedioPagoRequest request) {
        TarjetaCredito tc = new TarjetaCredito();
        mapTarjeta(tc, request);
        tc.setCuotas(request.getCuotas());
        return tc;
    }

    private TarjetaDebito construirTarjetaDebito(MedioPagoRequest request) {
        TarjetaDebito td = new TarjetaDebito();
        mapTarjeta(td, request);
        return td;
    }

    private void mapTarjeta(Tarjeta t, MedioPagoRequest request) {
        t.setNombre(request.getNombre());
        t.setApellido(request.getApellido());
        t.setCodigo(request.getCodigo());
        t.setNroTarjeta(request.getNroTarjeta());
        t.setFechaVencimiento(toDate(request.getFechaVencimiento()));
    }

    private void validarMedioPago(MedioPagoRequest request) {
        if (request == null || request.getTipo() == null) {
            throw new IllegalArgumentException("Tipo de medio de pago obligatorio.");
        }
        BigDecimal monto = valorNoNulo(request.getMonto());
        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto del medio de pago debe ser mayor que cero.");
        }
        switch (request.getTipo()) {
            case MONEDA_EXTRANJERA -> {
                if (request.getCotizacion() == null || request.getCotizacion().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalArgumentException("Debe informar la cotizacion de la moneda extranjera.");
                }
                if (request.getTipoMoneda() == null || request.getTipoMoneda().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el tipo de moneda extranjera.");
                }
            }
            case CHEQUE -> {
                if (request.getNroCheque() == null || request.getNroCheque().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el numero de cheque.");
                }
                if (request.getNombrePropietario() == null || request.getNombrePropietario().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el nombre del propietario del cheque.");
                }
                if (request.getBanco() == null || request.getBanco().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el banco del cheque.");
                }
                if (request.getPlazo() == null || request.getPlazo().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el plazo del cheque.");
                }
                if (request.getFechaCobro() == null) {
                    throw new IllegalArgumentException("Debe informar la fecha de cobro del cheque.");
                }
            }
            case TARJETA_CREDITO, TARJETA_DEBITO -> {
                if (request.getNombre() == null || request.getNombre().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el nombre de la tarjeta.");
                }
                if (request.getApellido() == null || request.getApellido().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el apellido de la tarjeta.");
                }
                if (request.getCodigo() == null) {
                    throw new IllegalArgumentException("Debe informar el codigo de la tarjeta.");
                }
                if (request.getNroTarjeta() == null || request.getNroTarjeta().isBlank()) {
                    throw new IllegalArgumentException("Debe informar el numero de la tarjeta.");
                }
                if (request.getFechaVencimiento() == null) {
                    throw new IllegalArgumentException("Debe informar la fecha de vencimiento de la tarjeta.");
                }
                if (request.getTipo() == MedioPagoRequest.TipoMedioPago.TARJETA_CREDITO && request.getCuotas() == null) {
                    throw new IllegalArgumentException("Debe informar las cuotas para la tarjeta de credito.");
                }
            }
            case EFECTIVO -> {
                // sin validaciones adicionales
            }
            default -> {
                // nada
            }
        }
    }

    private BigDecimal valorNoNulo(BigDecimal value) {
        return valorNoNulo(value, BigDecimal.ZERO);
    }

    private BigDecimal valorNoNulo(BigDecimal value, BigDecimal defaultValue) {
        return value == null ? defaultValue : value;
    }

    private LocalDate toLocalDate(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private Date toDate(LocalDate localDate) {
        if (localDate == null) return null;
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
