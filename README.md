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
- No hay script de seed en el repo. La conexión por defecto está en `src/main/resources/application.properties`:
  `jdbc:mysql://51.81.56.61:3306/sergioz_msanb2011` – user `sergioz_user` – pass `102lbdos4l7m`.


### Instalacion para el backend

- VS Code (extensiones): Extension Pack for Java (Microsoft) y Spring Boot Extension Pack.
- 
## Nota sobre la "Extension Pack for Java"

Si se utiliza **VS Code** con el **Java Extension Pack**, la extensión puede requerir **JDK 21 o superior** para ejecutarse.
Esto **no cambia la versión del proyecto**, que utiliza **Java 17**.

Es válido tener ambos JDK instalados:
- Java 21 → para el IDE (VS Code)
- Java 17 → para compilar y ejecutar el proyecto (Maven / Spring Boot)


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
- **CU02 Buscar Huesped**: `GET /huespedes/busqueda?apellido=&nombre=&nroDoc=&tipoDoc=`. Si no hay resultados retorna 204 o 404 según lógica; con datos muestra lista.
- **CU03 Buscar Responsable de Pago**: `GET /responsables?razonSocial=&cuit=`. Lista las razones sociales que matchean.
- **CU04 Reservar Habitacion**: `POST /reservas` con el payload de reservas seleccionadas (usa CU05 para disponibilidad). Devuelve listado de reservas creadas.
- **CU05 Mostrar Estado de Habitaciones**: `GET /habitaciones/estado?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` para colorear disponibilidad en el rango.
- **CU06 Cancelar Reserva**: `GET /reservas/buscar?apellido=&nombre=` para listar, y `POST /reservas/cancelar` con ids a cancelar.
- **CU07 Facturar**: `GET /facturacion/ocupantes?numeroHabitacion=&fechaEgreso=` busca quienes pueden facturarse; `POST /facturacion/previsualizacion` arma la factura previa; `POST /facturacion` genera la factura.
- **CU09 Dar alta de Huesped**: `POST /huespedes` con los datos del nuevo huesped.
- **CU10 Modificar Huesped**: `PUT /huespedes` con los datos actualizados.
- **CU11 Dar baja de Huesped**: `GET /huespedes/{tipoDoc}/{nroDoc}/puede-eliminar` para validar y `DELETE /huespedes/{tipoDoc}/{nroDoc}` para eliminar.
- **CU12 Dar alta de Responsable de Pago**: `POST /responsables` con los datos fiscales.
- **CU13 Modificar Responsable de Pago**: `PUT /responsables/{id}`.
- **CU14 Dar baja de Responsable de Pago**: `DELETE /responsables/{id}`.
- **CU15 Ocupar habitacion (check-in)**: `POST /estadias/ocupar` con la ocupacion seleccionada (usa CU05 para validar disponibilidad).
- **CU16 Ingresar pago de factura**: `GET /pagos/pendientes?numeroHabitacion=` para listar facturas a pagar; `POST /pagos` con el pago (medio: efectivo, tarjeta, cheque, etc.).
- **CU17 Listar cheques**: no hay endpoint expuesto en este backend (pendiente de implementar).
- **CU18 Listar ingresos**: no hay endpoint expuesto en este backend (pendiente de implementar).
- **CU19 Ingresar nota de credito**: `GET /notas-credito/pendientes?cuit=&tipoDoc=&nroDoc=` para facturas pendientes; `POST /notas-credito` genera la nota de credito.

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