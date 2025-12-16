package ar.edu.utn.frsf.sistemahotelero.service;

import ar.edu.utn.frsf.sistemahotelero.dao.EstadiaDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HabitacionDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.HuespedDAO;
import ar.edu.utn.frsf.sistemahotelero.dao.ReservaDAO;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparRequest;
import ar.edu.utn.frsf.sistemahotelero.dto.EstadiaOcuparResponse;
import ar.edu.utn.frsf.sistemahotelero.dto.ReservaHabitacionRequest;
import ar.edu.utn.frsf.sistemahotelero.enums.ReservaEstado;
import ar.edu.utn.frsf.sistemahotelero.model.Estadia;
import ar.edu.utn.frsf.sistemahotelero.model.Habitacion;
import ar.edu.utn.frsf.sistemahotelero.model.Reserva;
import ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId;
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
class GestorReservaImplTest {

    @Mock private HuespedDAO huespedDAO;
    @Mock private ReservaDAO reservaDAO;
    @Mock private HabitacionDAO habitacionDAO;
    @Mock private EstadiaDAO estadiaDAO;
    @Mock private GestorHabitacion gestorHabitacion;
    @Mock private PoliticaCancelacion politicaCancelacion;

    @InjectMocks
    private GestorReservaImpl service;

    @Test
    void reservarHabitaciones_validaYGuarda() {
        ReservaHabitacionRequest req = new ReservaHabitacionRequest();
        req.setNumeroHabitacion("1-101");
        req.setFechaInicio(LocalDate.now().plusDays(1));
        req.setFechaFin(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findById(any(HabitacionId.class))).thenReturn(Optional.of(hab));
        when(gestorHabitacion.validarDisponibilidad(any(), any(), any())).thenReturn(true);
        when(reservaDAO.save(any(Reserva.class))).thenAnswer(inv -> {
            Reserva r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });

        List<Reserva> result = service.reservarHabitaciones(
                List.of(req), "Juan", "Perez", "123456");

        assertThat(result).hasSize(1);
        verify(reservaDAO).save(any(Reserva.class));
    }

    @Test
    void cancelarReservas_validaYMarcaCancelada() {
        Reserva r = new Reserva();
        r.setId(1L);
        r.setEstado(ReservaEstado.RESERVADA);

        when(reservaDAO.findAllById(anyIterable())).thenReturn(List.of(r));

        List<Reserva> result = service.cancelarReservas(List.of(1L));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstado()).isEqualTo(ReservaEstado.CANCELADA);
        verify(politicaCancelacion).validarCancelacion(any(Reserva.class));
        verify(reservaDAO).saveAll(any());
    }

    @Test
    void reservarHabitaciones_fallaSinItems() {
        assertThatThrownBy(() -> service.reservarHabitaciones(List.of(), "A", "B", "111"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void reservarHabitaciones_fallaNoDisponible() {
        ReservaHabitacionRequest req = new ReservaHabitacionRequest();
        req.setNumeroHabitacion("1-101");
        req.setFechaInicio(LocalDate.now().plusDays(1));
        req.setFechaFin(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findById(any(HabitacionId.class))).thenReturn(Optional.of(hab));
        when(gestorHabitacion.validarDisponibilidad(any(), any(), any())).thenReturn(false);

        assertThatThrownBy(() -> service.reservarHabitaciones(List.of(req), "A", "B", "111"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void cancelarReservas_errorIdsInvalidos() {
        assertThatThrownBy(() -> service.cancelarReservas(List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void cancelarReservas_politicaRechaza() {
        Reserva r = new Reserva();
        r.setId(2L);
        r.setEstado(ReservaEstado.RESERVADA);
        when(reservaDAO.findAllById(anyIterable())).thenReturn(List.of(r));
        doThrow(new ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException("No")).when(politicaCancelacion).validarCancelacion(any());
        assertThatThrownBy(() -> service.cancelarReservas(List.of(2L)))
                .isInstanceOf(ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException.class);
    }

    @Test
    void buscarReservas_errorApellidoVacio() {
        assertThatThrownBy(() -> service.buscarReservas(" ", "Nombre"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void reservarHabitaciones_deduplicaYGuardaUnaSola() {
        ReservaHabitacionRequest req = new ReservaHabitacionRequest();
        req.setNumeroHabitacion("1-101");
        req.setFechaInicio(LocalDate.now().plusDays(1));
        req.setFechaFin(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findById(any(HabitacionId.class))).thenReturn(Optional.of(hab));
        when(gestorHabitacion.validarDisponibilidad(any(), any(), any())).thenReturn(true);
        when(reservaDAO.save(any(Reserva.class))).thenAnswer(inv -> {
            Reserva r = inv.getArgument(0);
            r.setId(20L);
            return r;
        });

        List<Reserva> result = service.reservarHabitaciones(List.of(req, req), "A", "B", "111");

        assertThat(result).hasSize(1);
        verify(reservaDAO, times(1)).save(any(Reserva.class));
    }

    @Test
    void buscarReservas_conNombre() {
        Reserva r = new Reserva();
        when(reservaDAO.buscarPorApellidoYNombre(anyString(), anyString(), any())).thenReturn(List.of(r));
        var result = service.buscarReservas("Perez", "Juan");
        assertThat(result).hasSize(1);
    }

    @Test
    void cancelarReservas_idNoExiste() {
        when(reservaDAO.findAllById(anyIterable())).thenReturn(List.of());
        assertThatThrownBy(() -> service.cancelarReservas(List.of(99L)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void buscarReservas_soloApellido() {
        Reserva r = new Reserva();
        when(reservaDAO.buscarPorApellido(anyString(), any())).thenReturn(List.of(r));
        var result = service.buscarReservas("Perez", null);
        assertThat(result).hasSize(1);
    }

    @Test
    void ocuparHabitacion_okSinReserva() {
        EstadiaOcuparRequest req = new EstadiaOcuparRequest();
        req.setNroPiso(1);
        req.setNroHabitacion(101);
        req.setFechaIngreso(LocalDate.now().plusDays(1));
        req.setFechaEgreso(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findByIdNroPisoAndIdNroHabitacion(1, 101)).thenReturn(Optional.of(hab));
        when(estadiaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of());
        when(reservaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of());
        when(estadiaDAO.save(any(Estadia.class))).thenAnswer(inv -> {
            Estadia e = inv.getArgument(0);
            e.setId(30L);
            return e;
        });

        EstadiaOcuparResponse resp = service.ocuparHabitacion(req);

        assertThat(resp.isRequiereConfirmacion()).isFalse();
        assertThat(resp.getEstadiaId()).isEqualTo(30L);
        verify(habitacionDAO).save(any(Habitacion.class));
    }

    @Test
    void ocuparHabitacion_reservadaRequiereConfirmacion() {
        EstadiaOcuparRequest req = new EstadiaOcuparRequest();
        req.setNroPiso(1);
        req.setNroHabitacion(101);
        req.setFechaIngreso(LocalDate.now().plusDays(1));
        req.setFechaEgreso(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findByIdNroPisoAndIdNroHabitacion(1, 101)).thenReturn(Optional.of(hab));
        when(estadiaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of());
        Reserva reserva = new Reserva();
        reserva.setId(50L);
        when(reservaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of(reserva));

        EstadiaOcuparResponse resp = service.ocuparHabitacion(req);

        assertThat(resp.isRequiereConfirmacion()).isTrue();
        assertThat(resp.getReservaInfo()).isNotNull();
        verify(estadiaDAO, never()).save(any());
    }

    @Test
    void ocuparHabitacion_conSolapadaActivaLanzaExcepcion() {
        EstadiaOcuparRequest req = new EstadiaOcuparRequest();
        req.setNroPiso(1);
        req.setNroHabitacion(101);
        req.setFechaIngreso(LocalDate.now().plusDays(1));
        req.setFechaEgreso(LocalDate.now().plusDays(2));

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findByIdNroPisoAndIdNroHabitacion(1, 101)).thenReturn(Optional.of(hab));
        when(estadiaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of(new Estadia()));

        assertThatThrownBy(() -> service.ocuparHabitacion(req))
                .isInstanceOf(ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException.class);
    }

    @Test
    void ocuparHabitacion_camposObligatorios() {
        EstadiaOcuparRequest req = new EstadiaOcuparRequest();
        req.setNroPiso(null);
        req.setNroHabitacion(null);
        assertThatThrownBy(() -> service.ocuparHabitacion(req))
                .isInstanceOf(ar.edu.utn.frsf.sistemahotelero.excepciones.ReglaNegocioException.class);
    }

    @Test
    void ocuparHabitacion_reservadaYConfirmaIgual() {
        EstadiaOcuparRequest req = new EstadiaOcuparRequest();
        req.setNroPiso(1);
        req.setNroHabitacion(101);
        req.setFechaIngreso(LocalDate.now().plusDays(1));
        req.setFechaEgreso(LocalDate.now().plusDays(2));
        req.setOcuparIgualSiReservada(true);

        Habitacion hab = new Habitacion(1, 101) {
            @Override public ar.edu.utn.frsf.sistemahotelero.enums.TipoHabitacion getTipoHabitacion() { return null; }
        };
        when(habitacionDAO.findByIdNroPisoAndIdNroHabitacion(1, 101)).thenReturn(Optional.of(hab));
        when(estadiaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of());
        Reserva reserva = new Reserva();
        reserva.setId(60L);
        when(reservaDAO.buscarPorHabitacionYRangoFechas(any(), any(), any(), any())).thenReturn(List.of(reserva));
        when(estadiaDAO.save(any(Estadia.class))).thenAnswer(inv -> {
            Estadia e = inv.getArgument(0);
            e.setId(200L);
            return e;
        });

        EstadiaOcuparResponse resp = service.ocuparHabitacion(req);
        assertThat(resp.isRequiereConfirmacion()).isFalse();
        assertThat(resp.getEstadiaId()).isEqualTo(200L);
        verify(reservaDAO).save(any(Reserva.class)); // marcó ocupada
    }
}
