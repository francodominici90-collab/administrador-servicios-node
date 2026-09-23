# Administrador de servicios y reservas — API REST

Proyecto desarrollado con Node.js, Express y FileSystem para gestionar servicios y reservas de un sistema de turnos.

Esta tercera entrega incorpora el recurso `bookings`. Los servicios se almacenan en `src/data/services.json` y las reservas en `src/data/bookings.json`. Los datos se conservan al reiniciar el servidor.

## Tecnologías

- Node.js
- JavaScript con ECMAScript Modules (ESM)
- Express
- dotenv
- FileSystem mediante `node:fs/promises`
- Persistencia en archivos JSON

## Instalación

Clonar el repositorio e ingresar en la carpeta del proyecto:

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

Las dos variables son obligatorias. Si falta alguna o está vacía, la aplicación falla al iniciar con un mensaje descriptivo.

Además, `PORT` debe ser un número entero positivo.

El archivo `.env.example` contiene las variables sin valores:

```env
PORT=
NODE_ENV=
```

El archivo `.env` y la carpeta `node_modules` están excluidos mediante `.gitignore`.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

Iniciar en modo desarrollo con reinicio automático:

```bash
npm run dev
```

Con la configuración del ejemplo, las URLs base son:

```text
http://localhost:8080/api/services
http://localhost:8080/api/bookings
```

Para detener el servidor, presionar `Ctrl + C`.

## Organización del proyecto

| Archivo | Responsabilidad |
| --- | --- |
| `src/config/env.config.js` | Carga y valida las variables de entorno |
| `src/managers/ServiceManager.js` | Gestiona servicios y su persistencia |
| `src/managers/BookingManager.js` | Gestiona reservas y su persistencia |
| `src/routes/services.router.js` | Define los endpoints de servicios |
| `src/routes/bookings.router.js` | Define los endpoints de reservas |
| `src/data/services.json` | Almacena los servicios |
| `src/data/bookings.json` | Almacena las reservas |
| `src/app.js` | Configura Express, interpreta JSON y monta los routers |
| `src/server.js` | Inicia el servidor en el puerto configurado |
| `package.json` | Define las dependencias y los scripts |
| `package-lock.json` | Registra las versiones de las dependencias |
| `.env.example` | Documenta las variables necesarias |
| `.gitignore` | Excluye archivos que no deben versionarse |
| `README.md` | Documenta la instalación y el uso del proyecto |

Los routers reciben las peticiones HTTP y delegan las operaciones en los managers.

Los managers contienen la lógica de validación y persistencia. Las operaciones de lectura y escritura utilizan `node:fs/promises`.

## Recurso services

Cada servicio tiene la siguiente estructura:

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

- `id`: identificador numérico generado internamente.
- `name`: nombre del servicio.
- `description`: descripción del servicio.
- `duration`: duración en minutos, mayor que cero.
- `price`: precio, mayor o igual que cero.
- `category`: categoría del servicio.
- `available`: disponibilidad, expresada como booleano.

Todos los campos, excepto `id`, son obligatorios al crear un servicio.

Los campos de texto no pueden estar vacíos. El valor `false` es válido para `available` y el valor `0` es válido para `price`.

## Endpoints de servicios

| Método | Ruta | Comportamiento | Estados principales |
| --- | --- | --- | --- |
| GET | `/api/services` | Lista los servicios y permite filtrarlos | 200, 400 |
| GET | `/api/services/:sid` | Busca un servicio por ID | 200, 404 |
| POST | `/api/services` | Crea un servicio | 201, 400 |
| PUT | `/api/services/:sid` | Actualiza un servicio | 200, 400, 404 |
| DELETE | `/api/services/:sid` | Elimina un servicio | 200, 404 |

### GET /api/services

Devuelve un array con todos los servicios.

Acepta los siguientes filtros opcionales:

- `category`: filtra por categoría, sin distinguir mayúsculas y minúsculas.
- `available`: filtra por disponibilidad utilizando `true` o `false`.

Los filtros pueden combinarse:

```text
GET /api/services?category=Consultas&available=true
```

Si ningún servicio coincide, responde con estado `200` y un array vacío:

```json
[]
```

Si `available` tiene un valor inválido, responde con estado `400`.

### GET /api/services/:sid

Ejemplo:

```text
GET /api/services/1
```

Responde con estado `200` y el servicio encontrado.

Si no existe, responde con estado `404`:

```json
{
  "error": "Servicio no encontrado"
}
```

### POST /api/services

Crea un servicio con los datos del body.

Enviar el encabezado:

```text
Content-Type: application/json
```

Ejemplo de body:

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

No se debe enviar el `id`: lo genera internamente `ServiceManager`.

Responde con estado `201` y el servicio creado.

Si faltan campos o los valores son inválidos, responde con estado `400`.

### PUT /api/services/:sid

Actualiza los campos enviados en el body y conserva los restantes.

```text
PUT /api/services/2
```

Ejemplo de body:

```json
{
  "price": 23000,
  "available": false
}
```

Responde con estado `200` y el servicio actualizado.

El ID original no puede modificarse. Si se incluye un `id` en el body, se ignora.

Si el servicio no existe, responde con estado `404`. Si los datos de actualización son inválidos, responde con estado `400`.

### DELETE /api/services/:sid

Ejemplo:

```text
DELETE /api/services/2
```

Responde con estado `200` y el servicio eliminado.

Si no existe, responde con estado `404`.

## Recurso bookings

Cada reserva tiene la siguiente estructura:

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

- `id`: identificador numérico generado internamente.
- `clientName`: nombre del cliente.
- `clientEmail`: correo electrónico del cliente.
- `date`: fecha válida con formato `YYYY-MM-DD`.
- `time`: hora con formato `HH:mm`, entre `00:00` y `23:59`.
- `status`: estado de la reserva; por defecto, `pending`.
- `services`: array con referencias a servicios y sus cantidades.

Cada elemento de `services` almacena el ID del servicio en `service` y su cantidad en `quantity`.

Si se agrega nuevamente el mismo servicio, aumenta su cantidad sin duplicar el elemento.

## Endpoints de reservas

| Método | Ruta | Comportamiento | Estados principales |
| --- | --- | --- | --- |
| POST | `/api/bookings` | Crea una reserva | 201, 400 |
| GET | `/api/bookings/:bid` | Busca una reserva por ID | 200, 404 |
| POST | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva | 200, 404 |

Los errores internos de lectura o escritura en estas rutas responden con estado `500`.

### POST /api/bookings

Enviar un body JSON con los datos del cliente y del turno:

```json
{
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-10-05",
  "time": "15:30",
  "status": "pending",
  "services": []
}
```

Los campos `clientName`, `clientEmail`, `date` y `time` son obligatorios.

Si se omite `status`, se utiliza `pending`. Si se proporciona, debe ser un texto no vacío.

En esta implementación las reservas se crean sin servicios. El campo `services` puede omitirse o enviarse como un array vacío. Los servicios se agregan mediante el endpoint específico.

El ID se genera internamente y no debe enviarse en el body.

La respuesta exitosa tiene estado `201` y contiene la reserva creada. Los datos inválidos producen una respuesta `400`.

### GET /api/bookings/:bid

Ejemplo:

```text
GET /api/bookings/1
```

Responde con estado `200` y la reserva encontrada.

Si no existe, responde con estado `404`:

```json
{
  "error": "Reserva no encontrada"
}
```

### POST /api/bookings/:bid/services/:sid

Ejemplo:

```text
POST /api/bookings/1/services/1
```

Agrega el servicio con ID `1` a la reserva con ID `1`. Esta petición no necesita body.

Antes de guardar, se comprueba que ambos recursos existan.

- Si el servicio todavía no está en la reserva, se agrega con `quantity: 1`.
- Si ya está, se incrementa `quantity` en una unidad.
- Si no existe la reserva o el servicio, se responde con estado `404` sin modificar el archivo.

La respuesta exitosa tiene estado `200` y contiene la reserva actualizada.

## Managers

### ServiceManager

| Método | Descripción |
| --- | --- |
| `getServices()` | Obtiene todos los servicios |
| `getServiceById(id)` | Devuelve un servicio o `null` |
| `addService(serviceData)` | Valida, genera el ID y guarda un servicio |
| `updateService(id, updatedData)` | Actualiza un servicio sin cambiar su ID; devuelve `null` si no existe |
| `deleteService(id)` | Elimina un servicio; devuelve `null` si no existe |

### BookingManager

| Método | Descripción |
| --- | --- |
| `createBooking(bookingData)` | Valida los datos, genera el ID y guarda una reserva |
| `getBookingById(id)` | Devuelve una reserva o `null` |
| `addServiceToBooking(bookingId, serviceId)` | Valida ambos recursos y agrega el servicio o incrementa su cantidad |

Todos estos métodos son asíncronos y se utilizan con `await`.

## Recepción de datos HTTP

Los routers utilizan:

- `req.params` para obtener `sid` y `bid`.
- `req.query` para obtener los filtros de servicios.
- `req.body` para obtener los datos de creación y actualización.

`express.json()` se configura en `app.js` antes de montar los routers para interpretar los cuerpos JSON.

## Pruebas manuales

Iniciar el servidor y abrir otra terminal de PowerShell.

Ejecutar los siguientes ejemplos en orden y en la misma terminal para conservar las variables.

Las pruebas modifican los archivos JSON. Utilizar datos ficticios.

### Crear un servicio de prueba

```powershell
$serviceBody = @{
  name = "Servicio de prueba"
  description = "Servicio para comprobar la API"
  duration = 30
  price = 10000
  category = "Pruebas"
  available = $true
} | ConvertTo-Json

$createdService = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services" `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $serviceBody

$serviceId = $createdService.id
$createdService
```

### Consultar servicios

```powershell
curl.exe -i http://localhost:8080/api/services

curl.exe -i "http://localhost:8080/api/services/$serviceId"
```

La opción `-i` permite visualizar los encabezados y el estado HTTP.

### Actualizar y comprobar la protección del ID

El campo `id` se incluye intencionalmente para comprobar que no pueda modificarse:

```powershell
$updateBody = @{
  id = 999999
  price = 12000
  available = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services/$serviceId" `
  -Method PUT `
  -ContentType "application/json; charset=utf-8" `
  -Body $updateBody
```

El precio y la disponibilidad deben actualizarse, manteniendo el ID original.

### Probar filtros

```powershell
curl.exe -i "http://localhost:8080/api/services?category=Pruebas&available=false"
```

La respuesta debe incluir el servicio de prueba.

Para comprobar un filtro inválido:

```powershell
curl.exe -i "http://localhost:8080/api/services?available=hola"
```

El resultado esperado es `400 Bad Request`.

### Eliminar el servicio de prueba

Este servicio aún no está asociado a ninguna reserva:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services/$serviceId" `
  -Method DELETE

curl.exe -i "http://localhost:8080/api/services/$serviceId"
```

La eliminación debe ser exitosa y la consulta posterior debe responder `404`.

### Crear una reserva

```powershell
$bookingBody = @{
  clientName = "Cliente de prueba"
  clientEmail = "cliente@example.com"
  date = "2026-10-05"
  time = "15:30"
  status = "pending"
  services = @()
} | ConvertTo-Json

$bookingResponse = Invoke-WebRequest `
  -Uri "http://localhost:8080/api/bookings" `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $bookingBody `
  -UseBasicParsing

$bookingResponse.StatusCode

$createdBooking = $bookingResponse.Content | ConvertFrom-Json
$bookingId = $createdBooking.id

$createdBooking | ConvertTo-Json -Depth 5
```

El resultado esperado es `201` y una reserva con ID generado y `services: []`.

### Agregar un servicio a la reserva

Este ejemplo utiliza el servicio original con ID `1`. Si ya no existe, reemplazar ese ID por el de un servicio existente.

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/bookings/$bookingId/services/1" `
  -Method POST |
  ConvertTo-Json -Depth 5
```

La reserva debe contener:

```json
{
  "service": 1,
  "quantity": 1
}
```

Repetir la petición:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/bookings/$bookingId/services/1" `
  -Method POST |
  ConvertTo-Json -Depth 5
```

Debe conservarse un único elemento con `quantity: 2`.

### Comprobar persistencia

Detener el servidor con `Ctrl + C` y volver a iniciarlo:

```bash
npm start
```

En la terminal de pruebas, consultar la reserva:

```powershell
curl.exe -i "http://localhost:8080/api/bookings/$bookingId"
```

Debe responder `200` y conservar los datos, incluyendo `quantity: 2`.

### Comprobar recursos inexistentes

Utilizar IDs que no existan en los archivos JSON. Por ejemplo, si no existe el ID `999`:

```powershell
curl.exe -i http://localhost:8080/api/bookings/999

curl.exe -i -X POST "http://localhost:8080/api/bookings/$bookingId/services/999"

curl.exe -i -X POST http://localhost:8080/api/bookings/999/services/1
```

Las tres peticiones deben responder `404` sin modificar las reservas.

### Rechazar una reserva incompleta

```powershell
try {
  Invoke-RestMethod `
    -Uri "http://localhost:8080/api/bookings" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"clientName":"Prueba incompleta"}'
} catch {
  Write-Output ("Estado HTTP: " + [int]$_.Exception.Response.StatusCode)
  Write-Output $_.ErrorDetails.Message
}
```

Debe responder `400` e indicar que falta `clientEmail`. No debe agregar una reserva al archivo.

## Alcance de esta entrega

La aplicación permite administrar servicios, crear y consultar reservas, y agregar servicios a una reserva.

En esta etapa:

- La persistencia se realiza mediante archivos JSON.
- No se utiliza MongoDB.
- No se incluyen vistas ni WebSockets.
- No se comprueba la disponibilidad de horarios ni se evitan turnos superpuestos.
- Al agregar un servicio a una reserva se valida su existencia, pero no su campo `available`.
- No se implementan endpoints de edición o eliminación de reservas.
- Eliminar un servicio no elimina sus referencias en reservas existentes.

## Autor

Franco Dominici