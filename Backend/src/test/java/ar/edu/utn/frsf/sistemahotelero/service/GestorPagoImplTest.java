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
import java.math.BigDecimal;
import java.time.LocalDate;
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
