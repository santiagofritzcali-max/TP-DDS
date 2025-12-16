package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.FacturaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.NotaCreditoDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ResponsableDePagoDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.FacturaNotaCreditoDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.NotaCreditoGeneradaDTO;
import ar.edu.utn.frsf.sistemahotelero.dto.RegistrarNotaCreditoRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.FacturaEstado;
import ar.edu.utn.frsf.sistemahotelero.enums.PosicionIVA;
import ar.edu.utn.frsf.sistemahotelero.enums.TipoFact;
import ar.edu.utn.frsf.sistemahotelero.model.Factura;
import ar.edu.utn.frsf.sistemahotelero.model.NotaCredito;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaFisica;
import ar.edu.utn.frsf.sistemahotelero.model.PersonaJuridica;
import ar.edu.utn.frsf.sistemahotelero.model.ResponsableDePago;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GestorNotaCreditoImplTest {

    @Mock
    private FacturaDAO facturaDAO;
    @Mock
    private NotaCreditoDAO notaCreditoDAO;
    @Mock
    private ResponsableDePagoDAO responsableDAO;
    @Mock
    private HabitacionDAO habitacionDAO;

    @InjectMocks
    private GestorNotaCreditoImpl service;

    private PersonaFisica responsablePf;
    private PersonaJuridica responsablePj;
    private Factura factura;

    @BeforeEach
    void setUp() {
        responsablePf = new PersonaFisica();
        responsablePf.setId(1L);
        responsablePf.setPosicionIVA(PosicionIVA.ConsumidorFinal);
        responsablePf.setNombreOrazonSocial("Resp PF");

        responsablePj = new PersonaJuridica();
        responsablePj.setId(2L);
        responsablePj.setPosicionIVA(PosicionIVA.ResponsableInscripto);
        responsablePj.setNombreOrazonSocial("Resp PJ");

        factura = new Factura();
        factura.setIdFactura(10L);
        factura.setEstado(FacturaEstado.PENDIENTE);
        factura.setResponsableDePago(responsablePf);
        factura.setTotal(BigDecimal.valueOf(100));
        factura.setTipo(TipoFact.B);
    }

    @Test
    void generarNotaCredito_ok() {
        when(responsableDAO.findByCuit(anyString())).thenReturn(Optional.empty());
        when(responsableDAO.findPersonaFisicaByCuitNormalized(anyString())).thenReturn(Optional.of(responsablePf));
        when(facturaDAO.findById(10L)).thenReturn(Optional.of(factura));
        when(notaCreditoDAO.obtenerUltimoNumero()).thenReturn(1);
        when(notaCreditoDAO.save(any(NotaCredito.class))).thenAnswer(inv -> {
            NotaCredito n = inv.getArgument(0);
            n.setIdNotaCredito(5L);
            return n;
        });

        RegistrarNotaCreditoRequest req = new RegistrarNotaCreditoRequest();
        req.setCuit("20123456789");
        req.setFacturaIds(List.of(10L));

        NotaCreditoGeneradaDTO dto = service.generarNotaCredito(req);

        assertThat(dto.getNumeroNotaCredito()).isEqualTo(2);
        assertThat(dto.getTotal()).isEqualByComparingTo("100");
        assertThat(dto.getFacturas()).hasSize(1);
        FacturaNotaCreditoDTO factDto = dto.getFacturas().get(0);
        assertThat(factDto.getFacturaId()).isEqualTo(10L);

        ArgumentCaptor<Factura> facturaCaptor = ArgumentCaptor.forClass(Factura.class);
        verify(facturaDAO, atLeastOnce()).save(facturaCaptor.capture());
        assertThat(facturaCaptor.getValue().getEstado()).isEqualTo(FacturaEstado.CANCELADA);
        assertThat(facturaCaptor.getValue().getNotaCredito()).isNotNull();
    }

    @Test
    void generarNotaCredito_fallaFacturaNoPendiente() {
        factura.setEstado(FacturaEstado.PAGADA);
        when(responsableDAO.findByCuit(anyString())).thenReturn(Optional.empty());
        when(responsableDAO.findPersonaFisicaByCuitNormalized(anyString())).thenReturn(Optional.of(responsablePf));
        when(facturaDAO.findById(10L)).thenReturn(Optional.of(factura));

        RegistrarNotaCreditoRequest req = new RegistrarNotaCreditoRequest();
        req.setCuit("20123456789");
        req.setFacturaIds(List.of(10L));

        assertThatThrownBy(() -> service.generarNotaCredito(req))
                .isInstanceOf(IllegalArgumentException.class);
        verify(notaCreditoDAO, never()).save(any());
    }

    @Test
    void listarFacturasPendientes_ok() {
        when(responsableDAO.findByCuit(anyString())).thenReturn(Optional.of(responsablePj));
        factura.setResponsableDePago(responsablePj);
        when(facturaDAO.findByResponsableDePagoIdAndEstadoAndNotaCreditoIsNull(eq(2L), eq(FacturaEstado.PENDIENTE)))
                .thenReturn(List.of(factura));

        var result = service.listarFacturasPendientes("20123456789", null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFacturaId()).isEqualTo(10L);
    }

    @Test
    void generarNotaCredito_actualizaHabitacionYTipoA() {
        // responsable por doc
        when(responsableDAO.findByTipoDocAndNroDoc(any(), anyString())).thenReturn(Optional.of(responsablePf));

        // factura tipo A con estadia y habitacion
        factura.setTipo(TipoFact.A);
        factura.setTotal(BigDecimal.valueOf(121)); // IVA 21
        var hab = new ar.edu.utn.frsf.sistemahotelero.model.Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        var estadia = new ar.edu.utn.frsf.sistemahotelero.model.Estadia();
        estadia.setId(1L);
        estadia.setHabitacion(hab);
        factura.setEstadia(estadia);

        when(facturaDAO.findById(10L)).thenReturn(Optional.of(factura));
        when(notaCreditoDAO.obtenerUltimoNumero()).thenReturn(null); // cubrir generarNumero con null
        when(notaCreditoDAO.save(any(NotaCredito.class))).thenAnswer(inv -> {
            NotaCredito n = inv.getArgument(0);
            n.setIdNotaCredito(6L);
            return n;
        });
        when(facturaDAO.existsByEstadiaIdAndEstado(anyLong(), any())).thenReturn(false);

        RegistrarNotaCreditoRequest req = new RegistrarNotaCreditoRequest();
        req.setTipoDoc(ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento.DNI);
        req.setNroDoc("123");
        req.setFacturaIds(List.of(10L));

        NotaCreditoGeneradaDTO dto = service.generarNotaCredito(req);

        assertThat(dto.getNumeroNotaCredito()).isEqualTo(1);
        assertThat(dto.getIva()).isEqualByComparingTo("21.00");
        assertThat(dto.getNeto()).isEqualByComparingTo("100.00");
        verify(habitacionDAO).save(any());
    }

    @Test
    void listarFacturasPendientes_porDocumento() {
        when(responsableDAO.findByTipoDocAndNroDoc(any(), anyString())).thenReturn(Optional.of(responsablePf));
        factura.setResponsableDePago(responsablePf);
        factura.setTipo(TipoFact.A);
        factura.setTotal(BigDecimal.valueOf(121));
        when(facturaDAO.findByResponsableDePagoIdAndEstadoAndNotaCreditoIsNull(eq(1L), eq(FacturaEstado.PENDIENTE)))
                .thenReturn(List.of(factura));

        var result = service.listarFacturasPendientes(null, ar.edu.utn.frsf.sistemahotelero.enums.TipoDocumento.DNI, "123");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIva()).isEqualByComparingTo("21.00");
        assertThat(result.get(0).getNeto()).isEqualByComparingTo("100.00");
    }

    @Test
    void generarNotaCredito_errorSinFacturas() {
        assertThatThrownBy(() -> service.generarNotaCredito(new RegistrarNotaCreditoRequest()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void buscarResponsable_errorSinParametros() {
        RegistrarNotaCreditoRequest req = new RegistrarNotaCreditoRequest();
        req.setFacturaIds(List.of(10L));
        assertThatThrownBy(() -> service.generarNotaCredito(req))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
