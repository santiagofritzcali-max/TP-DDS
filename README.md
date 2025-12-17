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
spring.datasource.username=root
spring.datasource.password=root
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
### Cómo correr los tests y ver cobertura
1. Ubicarse en la carpeta Backend:
   cd Backend

2. Ejecutar tests con Maven Wrapper y generar el reporte JaCoCo:
   .\mvnw.cmd clean test

3. Abrir el reporte HTML de cobertura:
   Backend\target\site\jacoco\index.html

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
- GET `http://localhost:8080/api/huespedes/DNI/12345678/puede-eliminar`
- GET `http://localhost:8080/api/huespedes/DNI/28999333/puede-eliminar`
- DELETE `http://localhost:8080/api/huespedes/DNI/12345678`

### Reserva
- POST `http://localhost:8080/api/reservas`
```json
{
  "nombre": "Lucia",
  "apellido": "Valle",
  "telefono": "341-5554444",
  "reservas": [
    {
      "numeroHabitacion": "3-302",
      "fechaInicio": "2026-01-05",
      "fechaFin": "2026-01-08"
    },
    {
      "numeroHabitacion": "1-102",
      "fechaInicio": "2026-01-05",
      "fechaFin": "2026-01-08"
    }
  ]
}
```
- GET `http://localhost:8080/api/reservas/buscar?nombre=Lucia&apellido=Valle`
- POST `http://localhost:8080/api/reservas/cancelar`
```json
{
  "idsReservas": [3, 4]
}
```

### Habitaciones
- GET `http://localhost:8080/api/habitaciones/estado?desde=2026-01-01&hasta=2026-01-05`

### Estadia
- POST `http://localhost:8080/api/estadias/ocupar`
```json
{
  "nroHabitacion": 101,
  "nroPiso": 1,
  "fechaIngreso": "2026-01-10",
  "fechaEgreso": "2026-01-13",
  "huespedes": [
    { "tipoDoc": "DNI", "nroDoc": "28999333" },
    { "tipoDoc": "DNI", "nroDoc": "35123456" }
  ],
  "ocuparIgualSiReservada": false
}
```

### Responsable de pago
- GET `http://localhost:8080/api/responsables`
- GET `http://localhost:8080/api/responsables?razonSocial=Gomez, Maria`
- GET `http://localhost:8080/api/responsables/1`
- POST `http://localhost:8080/api/responsables`
```json
{
  "razonSocial": "NUEVO RESP",
  "cuit": "30-12345628-4",
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
- PUT `http://localhost:8080/api/responsables/5`
```json
{
  "razonSocial": "RESP MODIFICADO",
  "cuit": "30-12345628-4",
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
- DELETE `http://localhost:8080/api/responsables/5`

### Factura
- GET `http://localhost:8080/api/facturacion/ocupantes?numeroHabitacion=101&fechaEgreso=2026-01-13`
- POST `http://localhost:8080/api/facturacion/previsualizacion`
```json
{
  "estadiaId": 4,
  "huespedResponsable": { "tipoDoc": "DNI", "nroDoc": "28999333" },
  "cuitTercero": null
}
```
- POST `http://localhost:8080/api/facturacion`
```json
{
  "estadiaId": 4,
  "responsableId": 2,
  "idsItemsSeleccionados": ["ESTADIA", "SERV-5", "SERV-9"]
}
```

### Pago
- GET `http://localhost:8080/api/pagos/pendientes?numeroHabitacion=101`
- POST `http://localhost:8080/api/pagos`
```json
{
  "facturaId": 4,
  "medios": [
    {
      "tipo": "EFECTIVO",
      "monto": 5000
    },
    {
      "tipo": "TARJETA_CREDITO",
      "monto": 40000,
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
Antes de ejecutar este endpoint se debe de ocupar una habitacion y generar una factura
- POST `http://localhost:8080/api/notas-credito`
```json
{
  "cuit": null,
  "tipoDoc": "DNI",
  "nroDoc": 30111222,
  "facturaIds": [5]
}
```
