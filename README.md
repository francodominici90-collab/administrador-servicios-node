# Administrador de servicios — API REST

Proyecto desarrollado con Node.js y Express para administrar los servicios de un sistema de turnos y reservas.

Esta segunda entrega incorpora endpoints REST que utilizan la clase `ServiceManager` de la primera entrega. Los datos se almacenan en `src/data/services.json` y se conservan al reiniciar el servidor.

## Tecnologías

- Node.js
- JavaScript con ECMAScript Modules (ESM)
- Express
- dotenv
- Persistencia mediante FileSystem y archivos JSON

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

El archivo `.env.example` contiene los nombres de las variables sin valores:

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

Con la configuración del ejemplo, la URL base del recurso es:

```text
http://localhost:8080/api/services
```

Para detener el servidor, presionar `Ctrl + C`.

## Organización del proyecto

| Archivo | Responsabilidad |
| --- | --- |
| `src/config/env.config.js` | Carga y valida las variables de entorno |
| `src/managers/ServiceManager.js` | Gestiona y valida los servicios, y lee y escribe el archivo JSON |
| `src/data/services.json` | Almacena los servicios |
| `src/routes/services.router.js` | Define los endpoints y sus respuestas HTTP |
| `src/app.js` | Configura Express, interpreta JSON y monta el router |
| `src/server.js` | Inicia el servidor en el puerto configurado |
| `package.json` | Define las dependencias y los scripts |
| `package-lock.json` | Registra las versiones de las dependencias |
| `.env.example` | Documenta las variables necesarias |
| `.gitignore` | Excluye archivos que no deben versionarse |
| `README.md` | Documenta la instalación y el uso del proyecto |

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

Los campos `name`, `description`, `duration`, `price`, `category` y `available` son obligatorios al crear un servicio.

Los campos de texto no pueden estar vacíos. El valor `false` es válido para `available` y el valor `0` es válido para `price`.

## Endpoints

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
- `available`: filtra por disponibilidad usando `true` o `false`.

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

Busca el servicio cuyo ID corresponde al parámetro `sid`.

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

Crea un servicio usando los datos del body.

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

Si la creación es exitosa, responde con estado `201` y el servicio creado, incluyendo su ID.

Si faltan campos o los valores no son válidos, responde con estado `400` y un mensaje descriptivo.

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

Elimina el servicio indicado:

```text
DELETE /api/services/2
```

Responde con estado `200` y el servicio eliminado.

Si no existe, responde con estado `404`.

## Recepción de datos HTTP

El router utiliza:

- `req.params.sid` para obtener el ID de la ruta.
- `req.query` para obtener los filtros.
- `req.body` para obtener los datos de creación y actualización.

`express.json()` se configura en `app.js` antes de montar el router, para interpretar los cuerpos JSON.

La lógica de persistencia y validación de los servicios permanece en `ServiceManager`.

## Métodos de ServiceManager

| Método | Descripción |
| --- | --- |
| `getServices()` | Obtiene todos los servicios |
| `getServiceById(id)` | Obtiene un servicio o devuelve `null` |
| `addService(serviceData)` | Valida, genera el ID y guarda un nuevo servicio |
| `updateService(id, updatedData)` | Actualiza un servicio sin cambiar su ID; devuelve `null` si no existe |
| `deleteService(id)` | Elimina un servicio; devuelve `null` si no existe |

Los métodos son asíncronos y se utilizan con `await`.

Ejemplo desde un archivo JavaScript ubicado en la raíz del proyecto:

```js
import ServiceManager from "./src/managers/ServiceManager.js";

const manager = new ServiceManager();

/* Consultar todos los servicios */
console.log(await manager.getServices());

/* Crear un servicio de prueba */
const createdService = await manager.addService({
  name: "Servicio de prueba",
  description: "Servicio para comprobar los metodos",
  duration: 30,
  price: 10000,
  category: "Pruebas",
  available: true
});

/* Consultar el servicio creado */
console.log(
  await manager.getServiceById(createdService.id)
);

/* Actualizar conservando el ID original */
console.log(
  await manager.updateService(createdService.id, {
    price: 12000,
    available: false
  })
);

/* Eliminar solamente el servicio de prueba */
console.log(
  await manager.deleteService(createdService.id)
);

/* Comprobar que ya no existe: devuelve null */
console.log(
  await manager.getServiceById(createdService.id)
);
```

## Pruebas manuales de la API

Con el servidor en ejecución, abrir otra terminal de PowerShell.

Los siguientes pasos se ejecutan en orden y en la misma terminal para conservar las variables.

### Consultar servicios

```powershell
curl.exe -i http://localhost:8080/api/services
```

La opción `-i` permite visualizar los encabezados y el estado HTTP.

### Crear un servicio

```powershell
$serviceBody = @{
  name = "Masaje relajante"
  description = "Masaje de una hora"
  duration = 60
  price = 20000
  category = "Salud"
  available = $true
} | ConvertTo-Json

$createdService = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services" `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $serviceBody

$createdService
```

### Consultar el servicio creado

Se utiliza el ID devuelto por el POST:

```powershell
$serviceId = $createdService.id

curl.exe -i "http://localhost:8080/api/services/$serviceId"
```

El resultado esperado es `200 OK` y los datos del servicio.

### Actualizar y comprobar la protección del ID

El campo `id` se incluye intencionalmente para comprobar que no pueda modificarse:

```powershell
$updateBody = @{
  id = 999999
  price = 23000
  available = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services/$serviceId" `
  -Method PUT `
  -ContentType "application/json; charset=utf-8" `
  -Body $updateBody
```

El precio y la disponibilidad deben actualizarse. El ID debe conservar su valor original.

### Probar filtros

```powershell
curl.exe -i "http://localhost:8080/api/services?category=Salud&available=false"
```

La respuesta debe incluir el servicio de prueba actualizado.

Para comprobar un filtro inválido:

```powershell
curl.exe -i "http://localhost:8080/api/services?available=hola"
```

El resultado esperado es `400 Bad Request`.

### Rechazar un servicio incompleto

```powershell
try {
  Invoke-RestMethod `
    -Uri "http://localhost:8080/api/services" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"name":"Servicio incompleto"}'
} catch {
  Write-Output ("Estado HTTP: " + [int]$_.Exception.Response.StatusCode)
  Write-Output $_.ErrorDetails.Message
}
```

El resultado esperado es un estado `400` con un mensaje sobre los campos faltantes. No debe crearse ningún servicio.

### Eliminar el servicio de prueba

Este comando elimina únicamente el servicio creado en el ejemplo anterior:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/services/$serviceId" `
  -Method DELETE
```

Comprobar que ya no existe:

```powershell
curl.exe -i "http://localhost:8080/api/services/$serviceId"
```

El resultado esperado es `404 Not Found`.

## Autor

Franco Dominici