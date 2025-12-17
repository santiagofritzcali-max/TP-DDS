package ar.edu.utn.frsf.sistemahotelero.config;

import ar.edu.utn.frsf.sistemahotelero.dao.*;
import ar.edu.utn.frsf.sistemahotelero.enums.*;
import ar.edu.utn.frsf.sistemahotelero.model.*;
import ar.edu.utn.frsf.sistemahotelero.util.FacturaFactory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeedInitializer {

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Bean
    CommandLineRunner seedData(HabitacionDAO habitacionDAO,
                               HuespedDAO huespedDAO,
                               ResponsableDePagoDAO responsableDAO,
                               ReservaDAO reservaDAO,
                               EstadiaDAO estadiaDAO,
                               ServicioDAO servicioDAO,
                               FacturaDAO facturaDAO,
                               PagoDAO pagoDAO) {
        return args -> {
            if (!seedEnabled) return;

            // Si ya hay habitaciones asumimos que la BD fue poblada.
            if (habitacionDAO.count() > 0) return;

            LocalDate hoy = LocalDate.now();

            // --- Habitaciones ---
            Habitacion h101 = habitacionDAO.save(crearHabitacion(
                    new IndividualEstandar(), 1, 101,
                    TipoCama.CamaIndividual, 1, EstadoHabitacion.Disponible,
                    new BigDecimal("45000"), "Individual estandar lista para reservar"));

            Habitacion h102 = habitacionDAO.save(crearHabitacion(
                    new DobleEstandar(), 1, 102,
                    TipoCama.CamaDoble, 1, EstadoHabitacion.Reservada,
                    new BigDecimal("62000"), "Doble estandar reservada a futuro"));

            Habitacion h201 = habitacionDAO.save(crearHabitacion(
                    new DobleSuperior(), 2, 201,
                    TipoCama.CamaDobleKingSize, 1, EstadoHabitacion.Ocupada,
                    new BigDecimal("85000"), "Doble superior ocupada (para facturar)"));

            Habitacion h202 = habitacionDAO.save(crearHabitacion(
                    new SuiteDoble(), 2, 202,
                    TipoCama.CamaDobleKingSize, 1, EstadoHabitacion.Ocupada,
                    new BigDecimal("110000"), "Suite doble con consumos pendientes de cobro"));

            Habitacion h301 = habitacionDAO.save(crearHabitacion(
                    new SuperiorFamilyPlan(), 3, 301,
                    TipoCama.CamaDoble, 2, EstadoHabitacion.FueraServicio,
                    new BigDecimal("130000"), "Family plan fuera de servicio por mantenimiento"));

            Habitacion h302 = habitacionDAO.save(crearHabitacion(
                    new IndividualEstandar(), 3, 302,
                    TipoCama.CamaIndividual, 1, EstadoHabitacion.Disponible,
                    new BigDecimal("47000"), "Individual libre para check-in con reserva"));

            // --- Huespedes ---
            Huesped juanPerez = huespedDAO.save(crearHuesped(
                    "30111222", TipoDocumento.DNI, "Perez", "Juan",
                    LocalDate.of(1985, 3, 10), "341-5551111", "juan.perez@example.com",
                    "Analista de sistemas", "Argentina", null, PosicionIVA.ConsumidorFinal,
                    new Direccion(null, "San Martin", "1234", "B", "4", "2000", "Rosario", "Rosario", "Santa Fe", "Argentina")));

            Huesped mariaGomez = huespedDAO.save(crearHuesped(
                    "28999333", TipoDocumento.DNI, "Gomez", "Maria",
                    LocalDate.of(1990, 7, 21), "341-5552222", "maria.gomez@example.com",
                    "Arquitecta", "Argentina", null, PosicionIVA.ConsumidorFinal,
                    new Direccion(null, "Mitre", "456", null, "2", "2000", "Rosario", "Rosario", "Santa Fe", "Argentina")));

            Huesped carlosSanchez = huespedDAO.save(crearHuesped(
                    "X12345", TipoDocumento.Pasaporte, "Sanchez", "Carlos",
                    LocalDate.of(1982, 12, 5), "011-40808080", "carlos.sanchez@example.com",
                    "Consultor", "Chile", "23-12345678-9", PosicionIVA.ResponsableInscripto,
                    new Direccion(null, "Libertad", "789", null, "8", "1000", "CABA", "CABA", "Buenos Aires", "Argentina")));

            Huesped luciaValle = huespedDAO.save(crearHuesped(
                    "35123456", TipoDocumento.DNI, "Valle", "Lucia",
                    LocalDate.of(1988, 11, 15), "341-5554444", "lucia.valle@example.com",
                    "Contadora", "Argentina", "27-35123456-3", PosicionIVA.ResponsableInscripto,
                    new Direccion(null, "Pellegrini", "999", "D", "9", "2000", "Rosario", "Rosario", "Santa Fe", "Argentina")));

            Huesped mateoLopez = huespedDAO.save(crearHuesped(
                    "50123456", TipoDocumento.DNI, "Lopez", "Mateo",
                    hoy.minusYears(14), "341-5557777", "mateo.lopez@example.com",
                    "Estudiante", "Argentina", null, PosicionIVA.ConsumidorFinal,
                    new Direccion(null, "Maipu", "321", null, "1", "2000", "Rosario", "Rosario", "Santa Fe", "Argentina")));

            Huesped lauraBlanco = huespedDAO.save(crearHuesped(
                    "41111222", TipoDocumento.DNI, "Blanco", "Laura",
                    LocalDate.of(1995, 6, 30), "341-5559999", "laura.blanco@example.com",
                    "Disenadora", "Argentina", null, PosicionIVA.ConsumidorFinal,
                    new Direccion(null, "Cordoba", "1500", null, "7", "5000", "Cordoba", "Cordoba", "Cordoba", "Argentina")));

            // --- Responsables de pago ---
            PersonaFisica respJuan = new PersonaFisica();
            respJuan.setHuesped(juanPerez);
            respJuan.setNroDoc(juanPerez.getNroDoc());
            respJuan.setTipoDoc(juanPerez.getTipoDoc());
            respJuan.setPosicionIVA(PosicionIVA.ConsumidorFinal);
            responsableDAO.save(respJuan);

            PersonaFisica respMaria = new PersonaFisica();
            respMaria.setHuesped(mariaGomez);
            respMaria.setNroDoc(mariaGomez.getNroDoc());
            respMaria.setTipoDoc(mariaGomez.getTipoDoc());
            respMaria.setPosicionIVA(PosicionIVA.ConsumidorFinal);
            responsableDAO.save(respMaria);

            PersonaJuridica respAcme = new PersonaJuridica();
            respAcme.setCuit("30-12345678-9");
            respAcme.setPosicionIVA(PosicionIVA.ResponsableInscripto);
            respAcme.setRazonSocial("Acme Corp SA");
            respAcme.setTelefono("011-4500-0000");
            respAcme.setDireccion(new Direccion(null, "Alem", "200", null, "10", "1001", "CABA", "CABA", "Buenos Aires", "Argentina"));
            responsableDAO.save(respAcme);

            PersonaJuridica respLuna = new PersonaJuridica();
            respLuna.setCuit("30-98765432-1");
            respLuna.setPosicionIVA(PosicionIVA.Monotributista);
            respLuna.setRazonSocial("Luna Viajes SRL");
            respLuna.setTelefono("011-4555-1212");
            respLuna.setDireccion(new Direccion(null, "Sarmiento", "845", "A", "5", "1001", "CABA", "CABA", "Buenos Aires", "Argentina"));
            responsableDAO.save(respLuna);

            // --- Reservas futuras (para CU04/CU06/CU15) ---
            Reserva reservaCancelable = new Reserva();
            reservaCancelable.setHabitacion(h102);
            reservaCancelable.setFechaInicio(hoy.plusDays(7));
            reservaCancelable.setFechaFin(hoy.plusDays(10));
            reservaCancelable.setFechaReserva(hoy);
            reservaCancelable.setNombre("Pedro");
            reservaCancelable.setApellido("Cancelar");
            reservaCancelable.setTelefono("341-1111111");
            reservaCancelable.setEstado(ReservaEstado.RESERVADA);
            reservaDAO.save(reservaCancelable);

            Reserva reservaParaCheckin = new Reserva();
            reservaParaCheckin.setHabitacion(h302);
            reservaParaCheckin.setFechaInicio(hoy.plusDays(3));
            reservaParaCheckin.setFechaFin(hoy.plusDays(4));
            reservaParaCheckin.setFechaReserva(hoy);
            reservaParaCheckin.setNombre("Carolina");
            reservaParaCheckin.setApellido("Checkin");
            reservaParaCheckin.setTelefono("341-2222222");
            reservaParaCheckin.setEstado(ReservaEstado.RESERVADA);
            reservaDAO.save(reservaParaCheckin);

            // --- Estadia activa con consumos (para CU07 facturar) ---
            Estadia estadiaActiva = new Estadia();
            estadiaActiva.setHabitacion(h201);
            estadiaActiva.setFechaIngreso(hoy.minusDays(1));
            estadiaActiva.setFechaEgreso(hoy.plusDays(1));
            estadiaActiva.setEstado(EstadiaEstado.ACTIVA);
            estadiaActiva.setHuespedes(List.of(juanPerez, mariaGomez));

            Servicio spa = new Servicio(null, "Uso de spa", toDate(hoy), "Acceso diario al spa", 20000.0, Consumos.UsoSpa, estadiaActiva);
            Servicio roomService = new Servicio(null, "Room service", toDate(hoy.minusDays(1)), "Cena en habitacion", 12000.0, Consumos.ServicioHabitacion, estadiaActiva);
            estadiaActiva.setServicios(List.of(spa, roomService));
            estadiaDAO.save(estadiaActiva); // cascade guarda servicios

            // --- Estadia finalizada con factura pendiente (para CU16/CU19) ---
            Estadia estadiaPendiente = new Estadia();
            estadiaPendiente.setHabitacion(h202);
            estadiaPendiente.setFechaIngreso(hoy.minusDays(5));
            estadiaPendiente.setFechaEgreso(hoy.minusDays(2));
            estadiaPendiente.setEstado(EstadiaEstado.FINALIZADA);
            estadiaPendiente.setHuespedes(List.of(carlosSanchez));
            estadiaDAO.save(estadiaPendiente);

            // --- Estadia pasada ya facturada/pagada (para ver medios de pago) ---
            Estadia estadiaPagada = new Estadia();
            estadiaPagada.setHabitacion(h101);
            estadiaPagada.setFechaIngreso(hoy.minusDays(25));
            estadiaPagada.setFechaEgreso(hoy.minusDays(22));
            estadiaPagada.setEstado(EstadiaEstado.FINALIZADA);
            estadiaPagada.setHuespedes(List.of(luciaValle));
            estadiaDAO.save(estadiaPagada);

            // --- Facturas pendientes ---
            Factura facturaPendientePago = new Factura();
            facturaPendientePago.setNumero(2001);
            facturaPendientePago.setFechaEmision(new Date());
            facturaPendientePago.setTotal(new BigDecimal("180000"));
            facturaPendientePago.setTipo(FacturaFactory.calcularTipo(respAcme));
            facturaPendientePago.setEstado(FacturaEstado.PENDIENTE);
            facturaPendientePago.setResponsableDePago(respAcme);
            facturaPendientePago.setEstadia(estadiaPendiente);
            facturaDAO.save(facturaPendientePago);

            Factura facturaPendienteNotaCredito = new Factura();
            facturaPendienteNotaCredito.setNumero(2002);
            facturaPendienteNotaCredito.setFechaEmision(new Date());
            facturaPendienteNotaCredito.setTotal(new BigDecimal("75000"));
            facturaPendienteNotaCredito.setTipo(FacturaFactory.calcularTipo(respAcme));
            facturaPendienteNotaCredito.setEstado(FacturaEstado.PENDIENTE);
            facturaPendienteNotaCredito.setResponsableDePago(respAcme);
            facturaPendienteNotaCredito.setEstadia(estadiaPendiente);
            facturaDAO.save(facturaPendienteNotaCredito);

            // --- Factura pagada con medios mixtos ---
            Pago pago = new Pago();
            pago.setFecha(new Date());

            List<MedioPago> medios = new ArrayList<>();

            Efectivo efectivo = new Efectivo();
            efectivo.setMonto(new BigDecimal("20000"));
            efectivo.setPago(pago);
            medios.add(efectivo);

            TarjetaCredito tc = new TarjetaCredito();
            tc.setMonto(new BigDecimal("25000"));
            tc.setPago(pago);
            tc.setCuotas(3);
            tc.setNombre("Maria");
            tc.setApellido("Gomez");
            tc.setCodigo(123);
            tc.setNroTarjeta("4111111111111111");
            tc.setFechaVencimiento(Date.from(hoy.plusYears(2).atStartOfDay(ZoneId.systemDefault()).toInstant()));
            medios.add(tc);

            Cheque cheque = new Cheque();
            cheque.setMonto(new BigDecimal("30000"));
            cheque.setPago(pago);
            cheque.setBanco("Banco Nacion");
            cheque.setNroCheque("00012345");
            cheque.setNombrePropietario("Lucia Valle");
            cheque.setPlazo("30 dias");
            cheque.setFechaCobro(Date.from(hoy.plusDays(15).atStartOfDay(ZoneId.systemDefault()).toInstant()));
            medios.add(cheque);

            pago.setMediosDePago(medios);
            pago.setMonto(new BigDecimal("75000"));
            pagoDAO.save(pago);

            Factura facturaPagada = new Factura();
            facturaPagada.setNumero(1999);
            facturaPagada.setFechaEmision(new Date());
            facturaPagada.setTotal(pago.getMonto());
            facturaPagada.setTipo(FacturaFactory.calcularTipo(respMaria));
            facturaPagada.setEstado(FacturaEstado.PAGADA);
            facturaPagada.setResponsableDePago(respMaria);
            facturaPagada.setEstadia(estadiaPagada);
            facturaPagada.setPago(pago);
            facturaDAO.save(facturaPagada);
        };
    }

    private Habitacion crearHabitacion(Habitacion h,
                                       int nroPiso,
                                       int nroHabitacion,
                                       TipoCama tipoCama,
                                       int cantidadCamas,
                                       EstadoHabitacion estado,
                                       BigDecimal tarifa,
                                       String descripcion) {
        h.setId(new ar.edu.utn.frsf.sistemahotelero.pkCompuestas.HabitacionId(nroPiso, nroHabitacion));
        h.setTipoDeCama(tipoCama);
        h.setCantidadCamas(cantidadCamas);
        h.setEstado(estado);
        h.setTarifa(tarifa);
        h.setDescripcion(descripcion);
        return h;
    }

    private Huesped crearHuesped(String nroDoc,
                                 TipoDocumento tipoDoc,
                                 String apellido,
                                 String nombre,
                                 LocalDate fechaNacimiento,
                                 String telefono,
                                 String email,
                                 String ocupacion,
                                 String nacionalidad,
                                 String cuit,
                                 PosicionIVA posicionIVA,
                                 Direccion direccion) {
        Huesped h = new Huesped();
        h.setNroDoc(nroDoc);
        h.setTipoDoc(tipoDoc);
        h.setApellido(apellido);
        h.setNombre(nombre);
        h.setFechaNacimiento(fechaNacimiento);
        h.setTelefono(telefono);
        h.setEmail(email);
        h.setOcupacion(ocupacion);
        h.setNacionalidad(nacionalidad);
        h.setCuit(cuit);
        h.setPosicionIVA(posicionIVA);
        h.setDireccion(direccion);
        return h;
    }

    private Date toDate(LocalDate date) {
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
