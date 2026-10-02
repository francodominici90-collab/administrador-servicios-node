# Administrador de servicios y reservas — API REST

API desarrollada con Node.js, Express y FileSystem para gestionar servicios y reservas de un sistema de turnos.

Esta quinta entrega incorpora las capas de services, repositories y DAO. Las responsabilidades de los managers anteriores se distribuyen entre esas capas y se elimina la carpeta `managers`.

Se conservan los ocho endpoints de la entrega anterior y la persistencia en archivos JSON.

## Tecnologías

- Node.js
- JavaScript con ECMAScript Modules (ESM)
- Express
- dotenv
- FileSystem mediante `node:fs/promises`
- Archivos JSON para persistencia

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/francodominici90-collab/administrador-servicios-node.git
cd administrador-servicios-node
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=8080
NODE_ENV=development
```

Ambas variables son obligatorias. Si falta alguna o está vacía, la aplicación falla al iniciar con un mensaje descriptivo.

La configuración comprueba que `PORT` sea un entero positivo. Para iniciar el servidor debe utilizarse un puerto válido y disponible.

El archivo `.env.example` contiene:

```env
PORT=
NODE_ENV=
```

`.env` y `node_modules/` están excluidos mediante `.gitignore`.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

Iniciar con reinicio automático ante cambios:

```bash
npm run dev
```

Con el puerto del ejemplo, la API está disponible en:

```text
http://localhost:8080
```

Para detener el servidor, presionar `Ctrl + C`.

## Arquitectura en capas

El recorrido de las operaciones es:

**Router → Controller → Service → Repository → DAO → archivo JSON**

| Capa | Responsabilidad |
| --- | --- |
| Router | Define los endpoints y los conecta con las funciones del controller |
| Controller | Lee los datos de la petición, llama al service y construye la respuesta HTTP |
| Service | Valida los datos y aplica las reglas de negocio |
| Repository | Ofrece métodos de acceso a datos y delega las operaciones al DAO |
| DAO | Consulta y modifica los registros almacenados en archivos JSON |

Los controllers utilizan `req.params`, `req.query` y `req.body`, y responden mediante `res.status().json()`.

Los services, repositories y DAO no utilizan `req` ni `res`.

El acceso a los archivos JSON se realiza exclusivamente en los DAO.

### Organización de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/config/env.config.js` | Carga y valida las variables de entorno |
| `src/routes/services.router.js` | Define las rutas de servicios |
| `src/routes/bookings.router.js` | Define las rutas de reservas |
| `src/controllers/services.controller.js` | Gestiona las peticiones y respuestas HTTP de servicios |
| `src/controllers/bookings.controller.js` | Gestiona las peticiones y respuestas HTTP de reservas |
| `src/services/services.service.js` | Valida servicios y procesa sus filtros |
| `src/services/bookings.service.js` | Valida reservas y gestiona la incorporación de servicios |
| `src/repositories/services.repository.js` | Delega el acceso a servicios en su DAO |
| `src/repositories/bookings.repository.js` | Delega el acceso a reservas en su DAO |
| `src/dao/services.dao.js` | Lee y escribe `services.json` |
| `src/dao/bookings.dao.js` | Lee y escribe `bookings.json` |
| `src/data/services.json` | Almacena los servicios |
| `src/data/bookings.json` | Almacena las reservas |
| `src/app.js` | Configura Express y monta los routers |
| `src/server.js` | Inicia el servidor |
| `package.json` | Define dependencias y scripts |
| `package-lock.json` | Registra las versiones de las dependencias |
| `.env.example` | Documenta las variables requeridas |
| `.gitignore` | Excluye archivos que no deben versionarse |
| `README.md` | Documenta la instalación, arquitectura y uso |

### Funciones por capa

| Recurso | Controller y service | Repository y DAO |
| --- | --- | --- |
| Servicios | `getServices`, `getServiceById`, `createService`, `updateService`, `deleteService` | `getAll`, `getById`, `create`, `update`, `delete` |
| Reservas | `createBooking`, `getBookingById`, `addServiceToBooking` | `create`, `getById`, `update` |

Las funciones de acceso a datos son asíncronas. Los controllers esperan sus resultados mediante `await`.

### Validaciones centralizadas

Las validaciones se concentran en los services.

En particular, `bookings.service.js` comprueba que existan la reserva y el servicio antes de asociarlos. El controller de reservas ya no repite esas consultas.

Si una operación devuelve `null`, el controller puede convertir ese resultado en una respuesta `404`. Esto interpreta el resultado de la operación sin realizar otra consulta.

Los DAO comprueban que el contenido leído del archivo sea un array. Esta comprobación corresponde al formato del almacenamiento, no a una regla de negocio.

### Regla de cantidades en reservas

La lógica para agregar servicios se encuentra en `bookings.service.js`:

- Si el servicio todavía no está asociado, se agrega con `quantity: 1`.
- Si ya está asociado, se incrementa su cantidad.
- El array conserva un único elemento por servicio.

El repository y el DAO reciben los datos actualizados para guardarlos; no calculan las cantidades.

### Generación y conservación del ID

Los DAO generan los IDs numéricos tomando el mayor ID existente en el archivo y sumando uno.

Los services de creación seleccionan los campos permitidos y no trasladan un ID proporcionado por el cliente.

En la actualización de servicios, el service excluye el ID del body. El DAO también conserva el identificador del registro almacenado.

### Nombre interno deleteById

La consigna requiere que el repository y el DAO de servicios expongan una función llamada `delete`.

Como `delete` es una palabra reservada de JavaScript, la función se declara internamente como `deleteById` y se exporta con un alias:

```javascript
export { deleteById as delete };
```

Por eso puede utilizarse de esta manera:

```javascript
servicesDao.delete(id);
```

No son dos operaciones diferentes: es la misma función con un nombre interno y otro nombre al exportarla.

### Función del repository

Actualmente los repositories delegan sus métodos directamente a los DAO.

Esta separación ofrece un punto de acceso a datos para los services y prepara el proyecto para reemplazar la persistencia en archivos por otra implementación.

Una futura migración a MongoDB deberá conservar los contratos de estas operaciones y considerar diferencias como el formato de los IDs.

## Recurso services

Ejemplo de servicio:

```json
{
  "id": 1,
  "name": "Consulta general",
  "description": "Consulta inicial para evaluar al cliente",
  "duration": 30,
  "price": 15000,
  "category": "Consultas",
  "available": true
}
```

| Campo | Validación |
| --- | --- |
| `id` | Generado internamente; no modificable por el cliente |
| `name` | Texto obligatorio y no vacío |
| `description` | Texto obligatorio y no vacío |
| `duration` | Número finito mayor que cero |
| `price` | Número finito mayor o igual que cero |
| `category` | Texto obligatorio y no vacío |
| `available` | Booleano obligatorio |

El valor `false` es válido para `available`, y `0` es válido para `price`.

Al guardar se eliminan los espacios de los extremos de los campos de texto.

## Endpoints de servicios

| Método | Ruta | Comportamiento | Estados habituales |
| --- | --- | --- | --- |
| GET | `/api/services` | Lista y filtra servicios | 200, 400 |
| GET | `/api/services/:sid` | Consulta un servicio | 200, 404 |
| POST | `/api/services` | Crea un servicio | 201, 400 |
| PUT | `/api/services/:sid` | Actualiza un servicio | 200, 400, 404 |
| DELETE | `/api/services/:sid` | Elimina un servicio | 200, 404 |

### Filtros

`GET /api/services` admite:

- `category`: coincidencia de categoría sin distinguir mayúsculas y minúsculas.
- `available`: admite `true` o `false`, sin distinguir mayúsculas y minúsculas.

Pueden combinarse:

```text
http://localhost:8080/api/services?category=Consultas&available=true
```

Un valor inválido para `available` produce una respuesta `400`.

Si no hay coincidencias, devuelve `200` y un array vacío.

### Creación

Ejemplo de body para `POST /api/services`:

```json
{
  "name": "Masaje relajante",
  "description": "Masaje de una hora",
  "duration": 60,
  "price": 20000,
  "category": "Salud",
  "available": true
}
```

Todos estos campos son obligatorios. No se debe enviar `id`.

La respuesta exitosa tiene estado `201` y contiene el servicio creado.

### Actualización

Ejemplo de body para `PUT /api/services/:sid`:

```json
{
  "price": 23000,
  "available": false
}
```

Se actualizan los campos enviados y se conservan los restantes. Los valores se validan antes de guardar.

Si el body incluye `id`, se ignora y se mantiene el ID original.

La actualización exige un objeto; no acepta un array como body.

### Consulta y eliminación

Si el servicio existe, GET devuelve el servicio y DELETE devuelve el registro eliminado, ambos con estado `200`.

Si no existe, responden con estado `404`:

```json
{
  "error": "Servicio no encontrado"
}
```

## Recurso bookings

Ejemplo de reserva:

```json
{
  "id": 1,
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-10-05",
  "time": "15:30",
  "status": "pending",
  "services": [
    {
      "service": 1,
      "quantity": 2
    }
  ]
}
```

| Campo | Validación o comportamiento |
| --- | --- |
| `id` | Generado internamente |
| `clientName` | Texto obligatorio y no vacío |
| `clientEmail` | Texto obligatorio con formato de correo |
| `date` | Fecha existente con formato `YYYY-MM-DD` |
| `time` | Hora con formato `HH:mm`, entre `00:00` y `23:59` |
| `status` | Texto no vacío; por defecto `pending` |
| `services` | Array de referencias y cantidades |

Cada elemento de `services` contiene únicamente:

```json
{
  "service": 1,
  "quantity": 1
}
```

## Endpoints de reservas

| Método | Ruta | Comportamiento | Estados habituales |
| --- | --- | --- | --- |
| POST | `/api/bookings` | Crea una reserva | 201, 400 |
| GET | `/api/bookings/:bid` | Consulta una reserva | 200, 404 |
| POST | `/api/bookings/:bid/services/:sid` | Agrega un servicio o aumenta su cantidad | 200, 404 |

### Creación

Ejemplo de body para `POST /api/bookings`:

```json
{
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-10-05",
  "time": "15:30",
  "services": []
}
```

Si se omite `status`, se guarda como `pending`.

Las reservas se crean sin servicios. El campo `services` puede omitirse o enviarse como un array vacío.

No se debe enviar el ID.

La respuesta exitosa tiene estado `201` y contiene la reserva creada.

### Consulta

`GET /api/bookings/:bid` responde con estado `200` y la reserva.

Si no existe, responde con estado `404`:

```json
{
  "error": "Reserva no encontrada"
}
```

### Incorporación de servicios

`POST /api/bookings/:bid/services/:sid` no necesita body.

El service comprueba primero la existencia de la reserva y después la del servicio.

Si falta alguno, responde `404` sin guardar cambios. Si ambos existen, agrega el servicio o incrementa su cantidad y responde `200` con la reserva actualizada.

## Manejo de errores

Los controllers gestionan las respuestas HTTP y conservan el comportamiento de la entrega anterior:

- `400`: datos o filtros inválidos. En POST y PUT de servicios también se utiliza para los errores de persistencia.
- `404`: servicio o reserva inexistente.
- `500`: errores internos en consultas y eliminación de servicios, y en operaciones de reservas.

Las respuestas de error contienen un mensaje descriptivo.

## Pruebas manuales con Postman

Iniciar el servidor antes de enviar peticiones.

En Postman, seleccionar el método HTTP en su selector e ingresar únicamente la URL en el campo de dirección.

Para enviar un body:

1. Abrir la pestaña **Body**.
2. Seleccionar **raw**.
3. Elegir **JSON**.
4. Ingresar el contenido.
5. Presionar **Send**.

Para peticiones sin body, seleccionar **none**.

Estas pruebas modifican los archivos JSON. Utilizar datos ficticios y anotar los IDs devueltos.

### 1. Consultar servicios

Método: **GET**

```text
http://localhost:8080/api/services
```

Esperado: `200` y el array de servicios.

Consultar el servicio original:

```text
http://localhost:8080/api/services/1
```

Esperado: `200` si se conservan los datos de ejemplo.

Consultar un ID inexistente:

```text
http://localhost:8080/api/services/999
```

Esperado: `404`, siempre que ese ID no exista.

### 2. Comprobar un filtro inválido

Método: **GET**

```text
http://localhost:8080/api/services?available=hola
```

Esperado: `400`, indicando que `available` debe ser `true` o `false`.

### 3. Crear un servicio temporal

Método: **POST**

```text
http://localhost:8080/api/services
```

Body:

```json
{
  "name": "Prueba DAO",
  "description": "Servicio temporal para probar la arquitectura",
  "duration": 30,
  "price": 10000,
  "category": "Pruebas",
  "available": true
}
```

Esperado: `201`. Anotar el ID generado como `ID_SERVICIO`.

En las siguientes URLs, reemplazar `ID_SERVICIO` por ese número.

### 4. Actualizar y comprobar la protección del ID

Método: **PUT**

```text
http://localhost:8080/api/services/ID_SERVICIO
```

Body:

```json
{
  "id": 999999,
  "price": 12000,
  "available": false
}
```

Esperado: `200`, precio `12000`, disponibilidad `false` y el ID original conservado.

### 5. Rechazar una actualización inválida

Método: **PUT**, en la misma URL.

Body:

```json
{
  "price": -1
}
```

Esperado: `400`.

Consultar después el servicio mediante **GET**, con **Body → none**. El precio debe seguir siendo `12000`.

### 6. Eliminar el servicio temporal

Método: **DELETE**, con **Body → none**.

```text
http://localhost:8080/api/services/ID_SERVICIO
```

Esperado: `200`.

Consultar la misma URL mediante **GET**. Debe responder `404`.

### 7. Crear una reserva

Método: **POST**

```text
http://localhost:8080/api/bookings
```

Body:

```json
{
  "clientName": "Prueba DAO",
  "clientEmail": "dao@example.com",
  "date": "2026-10-05",
  "time": "16:00",
  "services": []
}
```

Esperado: `201`, estado `pending` y array de servicios vacío.

Anotar el ID generado y utilizarlo en lugar de `ID_RESERVA`.

### 8. Agregar dos veces un servicio

Método: **POST**, con **Body → none**.

```text
http://localhost:8080/api/bookings/ID_RESERVA/services/1
```

Este ejemplo utiliza el servicio original con ID `1`. Si no existe, utilizar otro servicio existente.

Primera petición: `200` y `quantity: 1`.

Repetir la petición: `200` y `quantity: 2`, conservando un único elemento para ese servicio.

### 9. Comprobar recursos inexistentes

Método: **POST**, con **Body → none**.

Servicio inexistente:

```text
http://localhost:8080/api/bookings/ID_RESERVA/services/999
```

Esperado: `404` y `"Servicio no encontrado"`.

Reserva inexistente:

```text
http://localhost:8080/api/bookings/999/services/1
```

Esperado: `404` y `"Reserva no encontrada"`.

Utilizar IDs que realmente no existan en los archivos.

### 10. Rechazar una reserva incompleta

Método: **POST**

```text
http://localhost:8080/api/bookings
```

Body:

```json
{
  "clientName": "Prueba incompleta"
}
```

Esperado: `400`, indicando que `clientEmail` es obligatorio.

### 11. Comprobar persistencia

Detener el servidor con `Ctrl + C` y volver a iniciarlo:

```bash
npm start
```

En Postman, seleccionar **GET** y **Body → none**:

```text
http://localhost:8080/api/bookings/ID_RESERVA
```

Esperado: `200` y el servicio agregado con `quantity: 2`.

Esto comprueba que la reserva se conserva después del reinicio.

### Resultado de la verificación

Las pruebas anteriores se realizaron manualmente durante esta entrega.

También se comprobó que no quedaran referencias a los managers anteriores y que el servidor continuara funcionando después de eliminarlos.

Al finalizar se retiraron los datos temporales de las pruebas, conservando los datos de ejemplo del repositorio.

Actualmente no se incluye una suite de pruebas automatizadas ni un script `npm test`.

## Alcance y limitaciones

Esta entrega incorpora la arquitectura de cinco capas utilizando FileSystem.

- No se agregan endpoints nuevos.
- No se utiliza todavía MongoDB ni Mongoose.
- No se incluyen vistas ni WebSockets.
- No se comprueba la disponibilidad de horarios ni se evitan turnos superpuestos.
- Para asociar un servicio se valida su existencia, pero no su campo `available`.
- No hay endpoints de edición o eliminación de reservas.
- Eliminar un servicio no elimina sus referencias en reservas existentes.
- Las operaciones sobre JSON no implementan bloqueo ni transacciones; las escrituras simultáneas pueden sobrescribir cambios.

## Autor

Franco Dominici