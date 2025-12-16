package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.PagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.MedioPagoRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarPagoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadoHabitacion;
import ar.edu.utn.frsf.sistemahotelero.enums.EstadiaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Pago;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GestorPagoImplTest {

    @Mock private FacturaDAO facturaDAO;
    @Mock private PagoDAO pagoDAO;
    @Mock private HabitacionDAO habitacionDAO;

    @InjectMocks
    private GestorPagoImpl service;

    @Test
    void listarPendientes_ok() {
        Factura f = new Factura();
        f.setIdFactura(1L);
        f.setNumero(5001);
        f.setFechaEmision(java.util.Date.from(LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant()));
        f.setTotal(BigDecimal.TEN);
        f.setTipo(TipoFact.B);
        f.setEstado(FacturaEstado.PENDIENTE);

        when(facturaDAO.findByEstadiaHabitacionIdNroHabitacionAndEstado(101, FacturaEstado.PENDIENTE))
                .thenReturn(List.of(f));

        var result = service.listarFacturasPendientes(101);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstadoPago()).isEqualTo("PENDIENTE");
        assertThat(result.get(0).getNumeroFactura()).isEqualTo(5001);
    }

    @Test
    void registrarPago_ok() {
        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        hab.setEstado(EstadoHabitacion.Ocupada);

        Estadia estadia = new Estadia();
        estadia.setId(10L);
        estadia.setHabitacion(hab);
        estadia.setEstado(EstadiaEstado.ACTIVA);

        Factura factura = new Factura();
        factura.setIdFactura(1L);
        factura.setNumero(5001);
        factura.setTotal(BigDecimal.valueOf(200));
        factura.setEstado(FacturaEstado.PENDIENTE);
        factura.setEstadia(estadia);

        when(facturaDAO.findById(1L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(99L);
            return p;
        });
        when(facturaDAO.existsByEstadiaIdAndEstado(10L, FacturaEstado.PENDIENTE)).thenReturn(false);

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(1L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.valueOf(200));
        req.setMedios(List.of(mp));

        var dto = service.registrarPago(req);

        assertThat(dto.getPagoId()).isEqualTo(99L);
        assertThat(dto.getEstadoFactura()).isEqualTo("PAGADA");
        verify(facturaDAO, atLeastOnce()).save(any(Factura.class));
        verify(habitacionDAO).save(any(Habitacion.class));
    }

    @Test
    void registrarPago_conVueltoYMonedaExtranjera() {
        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        Estadia estadia = new Estadia();
        estadia.setId(20L);
        estadia.setHabitacion(hab);

        Factura factura = new Factura();
        factura.setIdFactura(2L);
        factura.setNumero(6001);
        factura.setTotal(BigDecimal.valueOf(100));
        factura.setEstado(FacturaEstado.PENDIENTE);
        factura.setEstadia(estadia);

        when(facturaDAO.findById(2L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(50L);
            return p;
        });
        when(facturaDAO.existsByEstadiaIdAndEstado(20L, FacturaEstado.PENDIENTE)).thenReturn(false);

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(2L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.MONEDA_EXTRANJERA);
        mp.setMonto(BigDecimal.valueOf(60));
        mp.setCotizacion(BigDecimal.valueOf(2)); // 60*2=120 aplica vuelto 20
        mp.setTipoMoneda("USD");
        req.setMedios(List.of(mp));

        var dto = service.registrarPago(req);

        assertThat(dto.getVuelto()).isEqualByComparingTo("20");
        assertThat(dto.getEstadoFactura()).isEqualTo("PAGADA");
    }

    @Test
    void registrarPago_errorMontoInsuficiente() {
        Factura factura = new Factura();
        factura.setIdFactura(3L);
        factura.setNumero(7001);
        factura.setTotal(BigDecimal.valueOf(300));
        factura.setEstado(FacturaEstado.PENDIENTE);

        when(facturaDAO.findById(3L)).thenReturn(Optional.of(factura));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(3L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.valueOf(100));
        req.setMedios(List.of(mp));

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_errorFacturaNoPendiente() {
        Factura factura = new Factura();
        factura.setIdFactura(4L);
        factura.setNumero(8001);
        factura.setTotal(BigDecimal.valueOf(100));
        factura.setEstado(FacturaEstado.PAGADA);

        when(facturaDAO.findById(4L)).thenReturn(Optional.of(factura));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(4L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.valueOf(100));
        req.setMedios(List.of(mp));

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void listarPendientes_errorHabitacionInvalida() {
        assertThatThrownBy(() -> service.listarFacturasPendientes(0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_errorChequeCamposObligatorios() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.CHEQUE);
        mp.setMonto(BigDecimal.TEN);
        assertThatThrownBy(() -> service.registrarPago(buildRequest(9L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_errorTarjetaCreditoSinCuotas() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_CREDITO);
        mp.setMonto(BigDecimal.TEN);
        mp.setNombre("n");
        mp.setApellido("a");
        mp.setCodigo(123);
        mp.setNroTarjeta("1234");
        mp.setFechaVencimiento(LocalDate.now().plusDays(1));
        // sin cuotas
        assertThatThrownBy(() -> service.registrarPago(buildRequest(10L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_errorMonedaExtranjeraSinCotizacion() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.MONEDA_EXTRANJERA);
        mp.setMonto(BigDecimal.TEN);
        mp.setTipoMoneda("USD");
        // sin cotizacion
        assertThatThrownBy(() -> service.registrarPago(buildRequest(11L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_conTarjetaDebitoValida() {
        Habitacion hab = new Habitacion(2, 201) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        Estadia estadia = new Estadia();
        estadia.setId(30L);
        estadia.setHabitacion(hab);

        Factura factura = new Factura();
        factura.setIdFactura(5L);
        factura.setNumero(9001);
        factura.setTotal(BigDecimal.valueOf(50));
        factura.setEstado(FacturaEstado.PENDIENTE);
        factura.setEstadia(estadia);

        when(facturaDAO.findById(5L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(77L);
            return p;
        });
        when(facturaDAO.existsByEstadiaIdAndEstado(30L, FacturaEstado.PENDIENTE)).thenReturn(false);

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.valueOf(50));
        mp.setNombre("John");
        mp.setApellido("Doe");
        mp.setCodigo(321);
        mp.setNroTarjeta("9999");
        mp.setFechaVencimiento(LocalDate.now().plusDays(30));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(5L);
        req.setMedios(List.of(mp));

        var dto = service.registrarPago(req);
        assertThat(dto.getPagoId()).isEqualTo(77L);
        assertThat(dto.getEstadoFactura()).isEqualTo("PAGADA");
    }

    @Test
    void registrarPago_conChequeValido() {
        Factura factura = new Factura();
        factura.setIdFactura(6L);
        factura.setNumero(9100);
        factura.setTotal(BigDecimal.valueOf(80));
        factura.setEstado(FacturaEstado.PENDIENTE);

        when(facturaDAO.findById(6L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(88L);
            return p;
        });

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.CHEQUE);
        mp.setMonto(BigDecimal.valueOf(80));
        mp.setBanco("Banco");
        mp.setNroCheque("123");
        mp.setNombrePropietario("Prop");
        mp.setPlazo("30d");
        mp.setFechaCobro(LocalDate.now().plusDays(5));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(6L);
        req.setMedios(List.of(mp));

        var dto = service.registrarPago(req);
        assertThat(dto.getPagoId()).isEqualTo(88L);
        assertThat(dto.getEstadoFactura()).isEqualTo("PAGADA");
    }

    @Test
    void registrarPago_errorFacturaSinTotal() {
        Factura factura = new Factura();
        factura.setIdFactura(7L);
        factura.setNumero(9101);
        factura.setTotal(null);
        factura.setEstado(FacturaEstado.PENDIENTE);
        when(facturaDAO.findById(7L)).thenReturn(Optional.of(factura));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(7L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.ONE);
        req.setMedios(List.of(mp));

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void validarMedioPago_errorTarjetaDebitoSinNombre() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.TEN);
        mp.setApellido("Apellido");
        mp.setCodigo(123);
        mp.setNroTarjeta("1234");
        mp.setFechaVencimiento(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(12L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_errorMonedaExtranjeraSinTipoMoneda() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.MONEDA_EXTRANJERA);
        mp.setMonto(BigDecimal.TEN);
        mp.setCotizacion(BigDecimal.ONE);
        // falta tipoMoneda
        assertThatThrownBy(() -> service.registrarPago(buildRequest(13L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_facturaNoExiste() {
        when(facturaDAO.findById(99L)).thenReturn(Optional.empty());
        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(99L);
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.ONE);
        req.setMedios(List.of(mp));
        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_errorMedioSinTipo() {
        Factura factura = new Factura();
        factura.setIdFactura(14L);
        factura.setNumero(1111);
        factura.setTotal(BigDecimal.ONE);
        factura.setEstado(FacturaEstado.PENDIENTE);
        when(facturaDAO.findById(14L)).thenReturn(Optional.of(factura));

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setMonto(BigDecimal.TEN);
        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(14L);
        req.setMedios(List.of(mp));

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_errorMontoCero() {
        Factura factura = new Factura();
        factura.setIdFactura(15L);
        factura.setNumero(2222);
        factura.setTotal(BigDecimal.ONE);
        factura.setEstado(FacturaEstado.PENDIENTE);
        when(facturaDAO.findById(15L)).thenReturn(Optional.of(factura));

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.ZERO);
        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(15L);
        req.setMedios(List.of(mp));

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_noLiberaHabitacionSiPendientes() {
        Habitacion hab = new Habitacion(3, 301) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        Estadia estadia = new Estadia();
        estadia.setId(40L);
        estadia.setHabitacion(hab);

        Factura factura = new Factura();
        factura.setIdFactura(8L);
        factura.setNumero(3333);
        factura.setTotal(BigDecimal.ONE);
        factura.setEstado(FacturaEstado.PENDIENTE);
        factura.setEstadia(estadia);

        when(facturaDAO.findById(8L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(66L);
            return p;
        });
        when(facturaDAO.existsByEstadiaIdAndEstado(40L, FacturaEstado.PENDIENTE)).thenReturn(true);

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.ONE);
        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(8L);
        req.setMedios(List.of(mp));

        service.registrarPago(req);

        verify(habitacionDAO, never()).save(any());
    }

    @Test
    void registrarPago_sinEstadiaNoActualizaHabitacion() {
        Factura factura = new Factura();
        factura.setIdFactura(9L);
        factura.setNumero(4444);
        factura.setTotal(BigDecimal.TEN);
        factura.setEstado(FacturaEstado.PENDIENTE);

        when(facturaDAO.findById(9L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(90L);
            return p;
        });

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.EFECTIVO);
        mp.setMonto(BigDecimal.TEN);
        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(9L);
        req.setMedios(List.of(mp));

        service.registrarPago(req);

        verify(habitacionDAO, never()).save(any());
    }

    @Test
    void validarMedioPago_chequeFaltaBanco() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.CHEQUE);
        mp.setMonto(BigDecimal.TEN);
        mp.setNroCheque("1");
        mp.setNombrePropietario("Prop");
        mp.setPlazo("30d");
        mp.setFechaCobro(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(16L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_chequeFaltaPlazo() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.CHEQUE);
        mp.setMonto(BigDecimal.TEN);
        mp.setNroCheque("1");
        mp.setNombrePropietario("Prop");
        mp.setBanco("Banco");
        mp.setFechaCobro(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(17L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_chequeFaltaFechaCobro() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.CHEQUE);
        mp.setMonto(BigDecimal.TEN);
        mp.setNroCheque("1");
        mp.setNombrePropietario("Prop");
        mp.setBanco("Banco");
        mp.setPlazo("30d");
        assertThatThrownBy(() -> service.registrarPago(buildRequest(18L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_tarjetaFaltaApellido() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.ONE);
        mp.setNombre("Nombre");
        mp.setCodigo(123);
        mp.setNroTarjeta("1234");
        mp.setFechaVencimiento(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(19L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_tarjetaFaltaCodigo() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.ONE);
        mp.setNombre("Nombre");
        mp.setApellido("Ape");
        mp.setNroTarjeta("1234");
        mp.setFechaVencimiento(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(20L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_tarjetaFaltaNro() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.ONE);
        mp.setNombre("Nombre");
        mp.setApellido("Ape");
        mp.setCodigo(111);
        mp.setFechaVencimiento(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> service.registrarPago(buildRequest(21L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_tarjetaFaltaFecha() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_DEBITO);
        mp.setMonto(BigDecimal.ONE);
        mp.setNombre("Nombre");
        mp.setApellido("Ape");
        mp.setCodigo(111);
        mp.setNroTarjeta("1234");
        assertThatThrownBy(() -> service.registrarPago(buildRequest(22L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void validarMedioPago_monedaCotizacionCero() {
        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.MONEDA_EXTRANJERA);
        mp.setMonto(BigDecimal.TEN);
        mp.setTipoMoneda("USD");
        mp.setCotizacion(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.registrarPago(buildRequest(23L, mp)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void registrarPago_tarjetaCreditoValida() {
        Factura factura = new Factura();
        factura.setIdFactura(24L);
        factura.setNumero(5555);
        factura.setTotal(BigDecimal.valueOf(50));
        factura.setEstado(FacturaEstado.PENDIENTE);
        when(facturaDAO.findById(24L)).thenReturn(Optional.of(factura));
        when(pagoDAO.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(120L);
            return p;
        });

        MedioPagoRequest mp = new MedioPagoRequest();
        mp.setTipo(MedioPagoRequest.TipoMedioPago.TARJETA_CREDITO);
        mp.setMonto(BigDecimal.valueOf(50));
        mp.setNombre("Nombre");
        mp.setApellido("Ape");
        mp.setCodigo(111);
        mp.setNroTarjeta("1234");
        mp.setFechaVencimiento(LocalDate.now().plusDays(10));
        mp.setCuotas(3);

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(24L);
        req.setMedios(List.of(mp));

        var dto = service.registrarPago(req);
        assertThat(dto.getEstadoFactura()).isEqualTo("PAGADA");
    }

    @Test
    void registrarPago_facturaNoPendiente() {
        Factura factura = new Factura();
        factura.setIdFactura(30L);
        factura.setEstado(FacturaEstado.CANCELADA);
        when(facturaDAO.findById(30L)).thenReturn(Optional.of(factura));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(30L);
        req.setMedios(List.of());

        assertThatThrownBy(() -> service.registrarPago(req))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void registrarPago_requestNull() {
        assertThatThrownBy(() -> service.registrarPago(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void listarPendientes_numeroHabitacionInvalido() {
        assertThatThrownBy(() -> service.listarFacturasPendientes(0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void listarPendientes_fechaYResponsableNull() {
        Factura f = new Factura();
        f.setIdFactura(40L);
        f.setNumero(8888);
        f.setEstado(FacturaEstado.PENDIENTE);
        f.setFechaEmision(null);
        f.setTotal(BigDecimal.valueOf(10));
        when(facturaDAO.findByEstadiaHabitacionIdNroHabitacionAndEstado(5, FacturaEstado.PENDIENTE))
                .thenReturn(List.of(f));

        var res = service.listarFacturasPendientes(5);
        assertThat(res).hasSize(1);
        assertThat(res.get(0).getFechaEmision()).isNull();
        assertThat(res.get(0).getResponsable()).isNull();
    }

    @Test
    void valorNoNulo_defaultBranch() throws Exception {
        Method m = GestorPagoImpl.class.getDeclaredMethod("valorNoNulo", BigDecimal.class, BigDecimal.class);
        m.setAccessible(true);
        BigDecimal result = (BigDecimal) m.invoke(service, null, BigDecimal.TEN);
        assertThat(result).isEqualTo(BigDecimal.TEN);
    }

    @Test
    void toDate_nullBranch() throws Exception {
        Method m = GestorPagoImpl.class.getDeclaredMethod("toDate", LocalDate.class);
        m.setAccessible(true);
        Date result = (Date) m.invoke(service, new Object[]{null});
        assertThat(result).isNull();
    }

    @Test
    void toLocalDate_nullBranch() throws Exception {
        Method m = GestorPagoImpl.class.getDeclaredMethod("toLocalDate", Date.class);
        m.setAccessible(true);
        LocalDate result = (LocalDate) m.invoke(service, new Object[]{null});
        assertThat(result).isNull();
    }

    private RegistrarPagoRequest buildRequest(Long facturaId, MedioPagoRequest mp) {
        Factura factura = new Factura();
        factura.setIdFactura(facturaId);
        factura.setNumero(9999);
        factura.setTotal(BigDecimal.ONE);
        factura.setEstado(FacturaEstado.PENDIENTE);
        when(facturaDAO.findById(facturaId)).thenReturn(Optional.of(factura));

        RegistrarPagoRequest req = new RegistrarPagoRequest();
        req.setFacturaId(facturaId);
        req.setMedios(List.of(mp));
        return req;
    }
}
