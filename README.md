# Administrador de servicios y reservas

API REST desarrollada con Node.js, Express y Mongoose para gestionar servicios y reservas de un sistema de turnos.

La aplicación utiliza MongoDB Atlas para persistir los datos y mantiene una arquitectura en capas:

**Routes → Controllers → Services → Repositories → DAO → MongoDB**

## Alcance de esta entrega

Esta entrega migra la persistencia desde archivos JSON hacia MongoDB Atlas con Mongoose, conservando las rutas de servicios y reservas.

Los identificadores pasan de números a ObjectId. La API mantiene la propiedad `id` en sus respuestas y la devuelve como un string.

También se mejora el manejo de errores de los controllers de servicios, diferenciando los errores de validación del cliente (`400`) de los errores internos (`500`), según la devolución de la entrega anterior.

> **Aclaración sobre `messages`:** Por indicación del docente en clase, se omite la entidad `messages` debido a una inconsistencia en la consigna. Esta entrega implementa la migración a MongoDB Atlas con Mongoose de los recursos `services` y `bookings`.

## Tecnologías

- Node.js con módulos ESM.
- Express.
- MongoDB Atlas.
- Mongoose.
- dotenv.

El proyecto se desarrolló y probó con Node.js 24.

## Requisitos

- Node.js y npm.
- Git.
- Un clúster de MongoDB Atlas.
- Un usuario de base de datos con permisos de lectura y escritura sobre la base utilizada.
- La dirección IP desde la que se ejecuta la aplicación autorizada en Atlas.
- Postman u otro cliente HTTP para probar los endpoints.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/francodominici90-collab/administrador-servicios-node.git
```

Entrar a la carpeta:

```bash
cd administrador-servicios-node
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz, tomando `.env.example` como referencia.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Completar las variables con los valores del entorno local.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto del servidor HTTP | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGO_URI` | URI de conexión a MongoDB Atlas | URI proporcionada por Atlas |

Ejemplo de `.env`:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URI="mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/turnos_reservas?appName=Cluster0"
```

Reemplazar `USUARIO`, `CONTRASENA` y `HOST_DEL_CLUSTER` con los datos correspondientes al clúster.

La contraseña pertenece al usuario de base de datos. No necesariamente coincide con la contraseña utilizada para ingresar al sitio de Atlas.

Si las credenciales contienen caracteres reservados de una URI, deben codificarse. Por ejemplo, `@` dentro de la contraseña se representa como `%40`.

El archivo `.env.example` contiene únicamente los nombres de las variables:

```dotenv
PORT=
NODE_ENV=
MONGO_URI=
```

La configuración valida que las tres variables estén presentes y tengan contenido. También verifica que `PORT` sea un número entero entre `1` y `65535`.

El archivo `.env` y la carpeta `node_modules` están excluidos mediante `.gitignore`.

## Ejecución

Iniciar la aplicación:

```bash
npm start
```

Ejecutar en modo desarrollo, con reinicio al detectar cambios:

```bash
npm run dev
```

La aplicación espera a que se establezca la conexión con MongoDB antes de iniciar el servidor HTTP.

Si la conexión inicial falla, muestra el error en la terminal y finaliza el proceso.

Con la configuración del ejemplo, la URL base es:

```text
http://localhost:8080
```

## Organización del proyecto

| Ubicación | Contenido |
| --- | --- |
| `src/config/env.config.js` | Carga y validación de variables de entorno |
| `src/config/db.config.js` | Conexión a MongoDB mediante Mongoose |
| `src/models/service.model.js` | Esquema y modelo de servicios |
| `src/models/booking.model.js` | Esquema y modelo de reservas |
| `src/routes/services.router.js` | Rutas de servicios |
| `src/routes/bookings.router.js` | Rutas de reservas |
| `src/controllers/services.controller.js` | Recepción y respuesta HTTP de servicios |
| `src/controllers/bookings.controller.js` | Recepción y respuesta HTTP de reservas |
| `src/services/services.service.js` | Validaciones y reglas de servicios |
| `src/services/bookings.service.js` | Validaciones y reglas de reservas |
| `src/repositories/services.repository.js` | Acceso al DAO de servicios |
| `src/repositories/bookings.repository.js` | Acceso al DAO de reservas |
| `src/dao/services.dao.js` | Operaciones de persistencia de servicios |
| `src/dao/bookings.dao.js` | Operaciones de persistencia de reservas |
| `src/app.js` | Configuración de Express y montaje de routers |
| `src/server.js` | Conexión a la base de datos y arranque del servidor |

## Responsabilidades de las capas

### Routes

Definen los endpoints y los vinculan con las funciones de los controllers.

### Controllers

Leen `req.params`, `req.query` y `req.body`, llaman a la capa service y construyen las respuestas HTTP.

También traducen los errores a sus códigos de estado correspondientes.

### Services

Contienen las validaciones de entrada y las reglas de negocio.

En reservas, esta capa comprueba que la reserva y el servicio existan antes de asociarlos. Si el servicio ya está agregado, incrementa su cantidad.

No utiliza `req` ni `res` y no accede directamente a MongoDB.

### Repositories

Ofrecen métodos de acceso a datos y delegan las operaciones en los DAO.

No contienen reglas de negocio.

### DAO

Ejecutan las consultas mediante los modelos de Mongoose.

Seleccionan los campos que se persisten y transforman los resultados al formato utilizado por las capas superiores.

Los ObjectId se convierten a strings al devolver los datos. Las respuestas conservan la propiedad `id` y no exponen los campos internos `_id` y `__v`.

### Models

Definen los campos, tipos y restricciones de los documentos.

Las validaciones de los modelos complementan las validaciones de entrada de la capa service.

## Métodos por recurso

| Recurso | Controller y service | Repository y DAO |
| --- | --- | --- |
| Servicios | `getServices`, `getServiceById`, `createService`, `updateService`, `deleteService` | `getAll`, `getById`, `create`, `update`, `delete` |
| Reservas | `createBooking`, `getBookingById`, `addServiceToBooking` | `create`, `getById`, `update` |

En los módulos correspondientes, la función de eliminación se declara como `deleteById` y se exporta con el alias `delete`, porque `delete` es una palabra reservada de JavaScript.

## Persistencia e identificadores

Los datos se almacenan en las colecciones `services` y `bookings` de MongoDB.

Mongoose genera automáticamente el `_id` de cada documento. El cliente no necesita enviar un identificador al crear un servicio o una reserva.

Los DAO excluyen los identificadores de los datos utilizados para crear o actualizar documentos.

En las reservas, cada servicio se almacena de esta forma:

```js
{
  service: ObjectId,
  quantity: Number
}
```

No se guarda una copia completa del servicio dentro de la reserva.

Los elementos del array de servicios no tienen un `_id` adicional. La reserva sí tiene su propio identificador.

Los registros de los antiguos archivos JSON no se importan automáticamente. En una base nueva, los recursos deben crearse mediante la API.

Los archivos JSON dejaron de utilizarse y fueron retirados de esta versión. Las versiones anteriores permanecen disponibles en el historial de Git.

## Recurso services

Ejemplo de respuesta:

```json
{
  "id": "6ac4f4ba99fb98cc2986b4d1",
  "name": "Consulta general",
  "description": "Consulta inicial para evaluar al cliente",
  "duration": 30,
  "price": 15000,
  "category": "Consultas",
  "available": true
}
```

### Validaciones

- `name`, `description` y `category`: strings no vacíos.
- `duration`: número finito mayor que cero, expresado en minutos.
- `price`: número finito mayor o igual que cero.
- `available`: booleano; tanto `true` como `false` son válidos.
- Todos los campos anteriores son obligatorios al crear un servicio.
- Las actualizaciones pueden ser parciales; se valida el resultado combinado con los datos existentes.
- El identificador no se puede modificar.

### Endpoints

| Método | Ruta | Comportamiento |
| --- | --- | --- |
| GET | `/api/services` | Devuelve todos los servicios; permite filtros |
| GET | `/api/services/:sid` | Devuelve un servicio o responde `404` |
| POST | `/api/services` | Crea un servicio y responde `201` |
| PUT | `/api/services/:sid` | Actualiza un servicio o responde `404` |
| DELETE | `/api/services/:sid` | Elimina y devuelve el servicio, o responde `404` |

### Filtros

Ejemplos:

```text
/api/services?category=Consultas
/api/services?available=true
/api/services?category=Consultas&available=false
```

Los filtros pueden combinarse.

La categoría se compara sin distinguir mayúsculas y minúsculas. El filtro `available` acepta `true` o `false`, también sin distinguir mayúsculas y minúsculas.

Un valor de disponibilidad distinto responde `400`.

Si no hay coincidencias, se devuelve `200` con un array vacío.

### Crear un servicio

**POST** `/api/services`

```json
{
  "name": "Consulta general",
  "description": "Consulta inicial para evaluar al cliente",
  "duration": 30,
  "price": 15000,
  "category": "Consultas",
  "available": true
}
```

Respuesta esperada: `201 Created` con el servicio y su `id`.

### Actualizar un servicio

**PUT** `/api/services/:sid`

```json
{
  "price": 18000,
  "available": false
}
```

Respuesta esperada: `200 OK` con los datos actualizados, conservando el identificador y los campos que no se modificaron.

## Recurso bookings

Ejemplo de respuesta:

```json
{
  "id": "6ac5001bfc83586c168833e3",
  "clientName": "Prueba MongoDB",
  "clientEmail": "mongo@example.com",
  "date": "2026-10-10",
  "time": "16:00",
  "status": "pending",
  "services": [
    {
      "service": "6ac4f4ba99fb98cc2986b4d1",
      "quantity": 2
    }
  ]
}
```

Los identificadores de los ejemplos son ilustrativos. Para probar la API, utilizar los devueltos por la propia base de datos.

### Validaciones y reglas

- `clientName`: string no vacío.
- `clientEmail`: string con formato de correo electrónico.
- `date`: fecha válida con formato `YYYY-MM-DD`.
- `time`: hora con formato `HH:mm`, de `00:00` a `23:59`.
- `status`: string no vacío; si se omite, se utiliza `pending`.
- `services`: puede omitirse o enviarse como un array vacío al crear la reserva.
- Los servicios se agregan mediante el endpoint de asociación.
- La reserva y el servicio deben existir.
- Si el servicio ya está asociado, se incrementa `quantity` sin duplicar la entrada.

La fecha y la hora se conservan como strings para mantener los formatos de la API anterior.

### Endpoints

| Método | Ruta | Comportamiento |
| --- | --- | --- |
| POST | `/api/bookings` | Crea una reserva y responde `201` |
| GET | `/api/bookings/:bid` | Devuelve una reserva o responde `404` |
| POST | `/api/bookings/:bid/services/:sid` | Agrega un servicio o incrementa su cantidad; responde `200` |

El endpoint de asociación responde `404` si la reserva o el servicio no existen.

### Crear una reserva

**POST** `/api/bookings`

```json
{
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-10-10",
  "time": "16:00",
  "status": "pending",
  "services": []
}
```

Respuesta esperada: `201 Created`.

### Agregar un servicio

**POST** `/api/bookings/:bid/services/:sid`

Esta petición no requiere body.

En la primera asociación se agrega:

```json
{
  "service": "6ac4f4ba99fb98cc2986b4d1",
  "quantity": 1
}
```

Si se repite la petición, la misma entrada pasa a tener `quantity: 2`.

## Respuestas y manejo de errores

| Código | Significado |
| --- | --- |
| `200` | Consulta, actualización, eliminación o asociación exitosa |
| `201` | Recurso creado |
| `400` | Datos de entrada o filtros inválidos |
| `404` | Recurso no encontrado |
| `500` | Error interno inesperado |

Ejemplo de recurso inexistente:

```json
{
  "error": "Servicio no encontrado"
}
```

En los controllers de servicios, los errores de validación identificados por la capa service y los errores de validación de Mongoose responden `400`.

Los errores inesperados responden `500`. El detalle se registra en la terminal y el cliente recibe un mensaje general.

Por ejemplo:

```json
{
  "error": "No se pudo crear el servicio"
}
```

Los identificadores con formato incompatible con ObjectId devuelven `null` desde los DAO y terminan respondiendo `404` mediante las capas superiores.

## Pruebas manuales con Postman

Seleccionar el método HTTP en el desplegable de Postman. En el campo de URL, escribir únicamente la dirección, sin anteponer `GET`, `POST` u otro método.

Para peticiones con datos, utilizar **Body → raw → JSON**.

### Comprobaciones realizadas durante la migración

1. Consultar servicios en una colección vacía: `200` con `[]`.
2. Crear un servicio: `201` con un identificador generado.
3. Consultar el listado y buscar el servicio por ID: `200`.
4. Actualizar precio y disponibilidad: `200`, conservando el ID.
5. Consultar nuevamente y verificar los cambios guardados.
6. Crear una reserva vacía: `201`.
7. Agregar un servicio a la reserva: `200` y `quantity: 1`.
8. Repetir la asociación: `200` y `quantity: 2`, sin duplicar la entrada.
9. Reiniciar el servidor y consultar la reserva: los datos se conservan.
10. Consultar un servicio inexistente: `404`.
11. Intentar asociar un servicio inexistente: `404`.
12. Enviar un servicio incompleto: `400`.
13. Crear un servicio temporal y eliminarlo: `200`.
14. Consultar o eliminar nuevamente el servicio eliminado: `404`.

### Prueba del manejo de errores internos

Durante el desarrollo se introdujo temporalmente una excepción dentro del controller de creación de servicios para verificar la respuesta `500`.

Se comprobó que:

- El cliente recibió un mensaje general.
- El detalle del error apareció en la terminal.
- Después de retirar la excepción y reiniciar, el body incompleto volvió a responder `400`.

La excepción temporal no forma parte del código final.

Esta prueba comprueba el manejo de una excepción inesperada en el controller; no simula una interrupción real de Atlas.

Las pruebas documentadas son manuales. El proyecto no incluye actualmente una suite automatizada ni un script `npm test`.

## Alcance y limitaciones actuales

- No se comprueba la superposición de turnos.
- La asociación comprueba que el servicio exista, pero no exige que `available` sea `true`.
- Eliminar un servicio no elimina sus referencias de reservas existentes.
- No se incluyen endpoints de edición o eliminación de reservas.
- Las respuestas de reservas contienen referencias a servicios; no utilizan `populate`.
- La actualización de cantidades utiliza una lectura seguida de una escritura. No se implementó control de concurrencia para asociaciones simultáneas.
- No se incorporan autenticación, vistas, WebSockets ni validación con Zod en esta entrega.

## Autor

Franco Dominici