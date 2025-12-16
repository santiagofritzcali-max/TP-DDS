# TP-DDS - Sistema Hotelero

Proyecto full-stack: **Backend** en Spring Boot (Java 17, Maven) y **Frontend** en React (Create React App).

## Requisitos
- Java 17
- Maven instalado (`mvn`); wrapper opcional `mvnw.cmd` (Windows) / `./mvnw` (Unix)
- Node 18+ y npm
- MySQL

## Backend (Spring Boot)
Ruta: `Backend/`

### DB y seed
- Crear la base `sistema_hotelero` en MySQL (o ajustar el nombre).
- Configurar la conexion en `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_hotelero
spring.datasource.username=USUARIO
spring.datasource.password=PASSWORD
```
- Seed opcional: habilitar con `app.seed.enabled=true` (por ejemplo `mvn spring-boot:run -Dapp.seed.enabled=true`).

### Instalación para el backend

- VS Code (extensiones): Extension Pack for Java (Microsoft) y Spring Boot Extension Pack.

## Nota sobre Java

El backend del proyecto está desarrollado y configurado para **Java 17**.

Al utilizar VS Code, algunas extensiones pueden requerir **Java 21 o superior** para funcionar.
Esto no afecta la compilación ni la ejecución del proyecto.


### Correr el backend en consola integrada
- Comando:
  ```bash
  cd Backend
  mvn spring-boot:run
  ```

### Correr el backend en consola externa
mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run   # Mac/Linux

### Tests backend
```bash
cd Backend
mvn test
```

## Frontend (React)
Ruta: `Frontend/`

### Instalación
```bash
cd Frontend
npm install
```

### Arrancar el frontend
```bash
npm start
```
- Abre `http://localhost:3000`.
- El front consume `http://localhost:8080/api`; si cambias el backend, ajusta `src/services/apiClient.js` y `src/services/estadoHabitacionService.js`.


## Endpoints de ejemplo (base `http://localhost:8080/api`)
- Para endpoints protegidos: autenticarse y enviar `Authorization: Bearer <token>`.

### Autenticacion
- POST `http://localhost:8080/api/auth/login`
```json
{
  "username": "conserje",
  "password": "deso2025!"
}
```
> Todos los endpoints (excepto /auth/login) requieren autenticación JWT.
> Enviar el header:
> Authorization: Bearer <token>

### Huesped
- GET `http://localhost:8080/api/huespedes/busqueda`
- GET `http://localhost:8080/api/huespedes/busqueda?apellido=&nombre=&nroDoc=&tipoDoc=`
- POST `http://localhost:8080/api/huespedes`
```json
{
  "apellido": "Perez",
  "nombre": "Juan",
  "tipoDoc": "DNI",
  "nroDoc": "12345678",
  "fechaNacimiento": "1990-05-10",
  "telefono": "3415551234",
  "email": "juan.perez@example.com",
  "ocupacion": "Ingeniero",
  "nacionalidad": "Argentina",
  "cuit": "20-12345678-3",
  "posicionIVA": "ConsumidorFinal",
  "direccion": {
    "calle": "San Martin",
    "numero": "1234",
    "departamento": "A",
    "piso": "3",
    "codigoPostal": "2000",
    "localidad": "Rosario",
    "ciudad": "Rosario",
    "provincia": "Santa Fe",
    "pais": "Argentina"
  },
  "aceptarDuplicado": false
}
```
- PUT `http://localhost:8080/api/huespedes`
```json
{
  "oldTipoDoc": "DNI",
  "oldNroDoc": "12345678",
  "nombre": "Juan Carlos",
  "apellido": "Perez",
  "tipoDoc": "DNI",
  "nroDoc": "12345678",
  "cuit": "20-12345678-3",
  "posicionIVA": "ConsumidorFinal",
  "fechaNacimiento": "1990-05-10",
  "telefono": "3415559999",
  "email": "juan.c.perez@example.com",
  "ocupacion": "Ingeniero",
  "nacionalidad": "Argentina",
  "direccion": {
    "calle": "San Martin",
    "numero": "1234",
    "departamento": "A",
    "piso": "3",
    "codigoPostal": "2000",
    "localidad": "Buenos Aires",
    "ciudad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "pais": "Argentina"
  },
  "aceptarDuplicado": false
}
```
- GET `http://localhost:8080/api/huespedes/DNI/46040214/puede-eliminar`
- GET `http://localhost:8080/api/huespedes/DNI/46150394/puede-eliminar`
- DELETE `http://localhost:8080/api/huespedes/DNI/12345678`

### Reserva
- POST `http://localhost:8080/api/reservas`
```json
{
  "nombre": "Sofia",
  "apellido": "Perez",
  "telefono": "1174198184",
  "reservas": [
    {
      "numeroHabitacion": "2-3",
      "fechaInicio": "2026-01-11",
      "fechaFin": "2026-01-13"
    },
    {
      "numeroHabitacion": "4-1",
      "fechaInicio": "2026-01-11",
      "fechaFin": "2026-01-13"
    }
  ]
}
```
- GET `http://localhost:8080/api/reservas/buscar?nombre=Sofia&apellido=Perez`
- POST `http://localhost:8080/api/reservas/cancelar`
```json
{
  "idsReservas": [26, 27]
}
```

### Habitaciones
- GET `http://localhost:8080/api/habitaciones/estado?desde=2026-01-01&hasta=2026-01-05`

### Estadia
- POST `http://localhost:8080/api/estadias/ocupar`
```json
{
  "nroHabitacion": 3,
  "nroPiso": 2,
  "fechaIngreso": "2026-01-10",
  "fechaEgreso": "2026-01-13",
  "huespedes": [
    { "tipoDoc": "DNI", "nroDoc": "89099870" },
    { "tipoDoc": "DNI", "nroDoc": "46040214" }
  ],
  "ocuparIgualSiReservada": false
}
```

### Responsable de pago
- GET `http://localhost:8080/api/responsables`
- GET `http://localhost:8080/api/responsables?razonSocial=Gomez, Ana&cuit=20333444555`
- GET `http://localhost:8080/api/responsables/401`
- POST `http://localhost:8080/api/responsables`
```json
{
  "razonSocial": "ACME SA",
  "cuit": "30-12345678-9",
  "posicionIVA": "ResponsableInscripto",
  "telefono": "+54 11 5555-5555",
  "direccion": {
    "calle": "Av. Siempre Viva",
    "numero": "742",
    "departamento": "A",
    "piso": "1",
    "codigoPostal": "3000",
    "localidad": "Santa Fe",
    "ciudad": "Santa Fe",
    "provincia": "Santa Fe",
    "pais": "Argentina"
  }
}
```
- PUT `http://localhost:8080/api/responsables/id`
```json
{
  "razonSocial": "ACME SA",
  "cuit": "30-12345678-9",
  "posicionIVA": "ResponsableInscripto",
  "telefono": "+54 11 5555-5555",
  "direccion": {
    "calle": "Av. Siempre Viva",
    "numero": "742",
    "departamento": "A",
    "piso": "1",
    "codigoPostal": "3000",
    "localidad": "Santa Fe",
    "ciudad": "Santa Fe",
    "provincia": "Santa Fe",
    "pais": "Argentina"
  }
}
```
- DELETE `http://localhost:8080/api/responsables/id`

### Factura
- GET `http://localhost:8080/api/facturacion/ocupantes?numeroHabitacion=101&fechaEgreso=2026-01-03`
- POST `http://localhost:8080/api/facturacion/previsualizacion`
```json
{
  "estadiaId": 718,
  "huespedResponsable": { "tipoDoc": "DNI", "nroDoc": "12345678" },
  "cuitTercero": null
}
```
- POST `http://localhost:8080/api/facturacion`
```json
{
  "estadiaId": 1,
  "responsableId": 10,
  "idsItemsSeleccionados": ["ESTADIA", "SERV-5", "SERV-9"]
}
```

### Pago
- GET `http://localhost:8080/api/pagos/pendientes?numeroHabitacion=808`
- POST `http://localhost:8080/api/pagos`
```json
{
  "facturaId": 25,
  "medios": [
    {
      "tipo": "EFECTIVO",
      "monto": 5000
    },
    {
      "tipo": "TARJETA_CREDITO",
      "monto": 15000,
      "nombre": "Juan",
      "apellido": "Perez",
      "codigo": 123,
      "nroTarjeta": "4111111111111111",
      "fechaVencimiento": "2026-05-31",
      "cuotas": 3
    }
  ]
}
```

### Nota de credito
- POST `http://localhost:8080/api/notas-credito`
```json
{
  "cuit": "30-12345678-9",
  "tipoDoc": "DNI",
  "nroDoc": "12345678",
  "facturaIds": [25, 26]
}
```
