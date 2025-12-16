# TP-DDS - Sistema Hotelero

Proyecto full-stack: **Backend** en Spring Boot (Java 17, Maven) y **Frontend** en React (Create React App).

## Requisitos
- Java 17
- Maven instalado (`mvn`); opcional wrapper: `mvnw.cmd` (Windows) / `./mvnw` (Unix)
- Node 18+ y npm
- MySQL

## Backend (Spring Boot)
Ruta: `Backend/`

### DB y seed
- No hay script de seed en el repositorio.
- La conexión a la base de datos se configura en  
  `src/main/resources/application.properties`.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_hotelero
spring.datasource.username=USUARIO
spring.datasource.password=PASSWORD


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

### Endpoints por CU (base `http://localhost:8080/api`)
- **CU01 Autenticar Usuario**: `POST /auth/login` con `{ "username": "...", "password": "..." }`. Devuelve JWT. Usuario inicial: `admin` / `admin123`.
- **CU02 Buscar Huesped**: `GET /huespedes/busqueda?apellido=&nombre=&nroDoc=&tipoDoc=`.
- **CU03 Buscar Responsable de Pago**: `GET /responsables?razonSocial=&cuit=`.
- **CU04 Reservar Habitacion**: `POST /reservas` con el payload de reservas seleccionadas (usa CU05 para disponibilidad). Devuelve listado de reservas creadas.
- **CU05 Mostrar Estado de Habitaciones**: `GET /habitaciones/estado?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`.
- **CU06 Cancelar Reserva**: `GET /reservas/buscar?apellido=&nombre=` y `POST /reservas/cancelar` con ids a cancelar.
- **CU07 Facturar**: `GET /facturacion/ocupantes?numeroHabitacion=&fechaEgreso=`, `POST /facturacion/previsualizacion` y `POST /facturacion`.
- **CU09 Dar alta de Huesped**: `POST /huespedes`.
- **CU10 Modificar Huesped**: `PUT /huespedes`.
- **CU11 Dar baja de Huesped**: `GET /huespedes/{tipoDoc}/{nroDoc}/puede-eliminar` y `DELETE /huespedes/{tipoDoc}/{nroDoc}`.
- **CU12 Dar alta de Responsable de Pago**: `POST /responsables`.
- **CU13 Modificar Responsable de Pago**: `PUT /responsables/{id}`.
- **CU14 Dar baja de Responsable de Pago**: `DELETE /responsables/{id}`.
- **CU15 Ocupar habitacion (check-in)**: `POST /estadias/ocupar`.
- **CU16 Ingresar pago de factura**: `GET /pagos/pendientes?numeroHabitacion=` y `POST /pagos`.
- **CU17 Listar cheques**: pendiente de implementación (sin endpoint expuesto).
- **CU18 Listar ingresos**: pendiente de implementación (sin endpoint expuesto).
- **CU19 Ingresar nota de credito**: `GET /notas-credito/pendientes?cuit=&tipoDoc=&nroDoc=` y `POST /notas-credito`.

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

### Tests frontend
```bash
npm test
```
