# Administrador de servicios y reservas

Proyecto desarrollado con Node.js, Express y MongoDB Atlas para gestionar servicios y reservas.

Incluye una API REST, vistas con Handlebars y actualizaciones en tiempo real mediante Socket.IO. La persistencia se realiza con Mongoose y la validación de las peticiones utiliza Zod.

## Tecnologías

- Node.js con ESM (`import` y `export`).
- Express.
- MongoDB Atlas y Mongoose.
- Zod.
- Handlebars.
- Socket.IO.
- dotenv.

## Requisitos

- Node.js 24.
- npm.
- Git.
- Una base de datos en MongoDB Atlas.
- Un usuario de base de datos y acceso de red configurados en Atlas.

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

Crear el archivo `.env` a partir de `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

Completar las variables con la configuración local.

## Variables de entorno

Ejemplo de configuración:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/turnos_reservas?retryWrites=true&w=majority
```

La URI es un ejemplo: debe reemplazarse por la conexión correspondiente al proyecto de Atlas.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor. |
| `NODE_ENV` | Entorno de ejecución. |
| `MONGO_URI` | URI de conexión a MongoDB Atlas. |

La aplicación valida las variables requeridas al iniciar. El puerto debe ser un número entero entre 1 y 65535.

El archivo `.env.example` contiene las variables sin valores.

`.env` y `node_modules/` están excluidos mediante `.gitignore`. No deben subirse credenciales reales al repositorio.

## Ejecución

Iniciar el servidor:

```bash
npm start
```

Ejecutar en desarrollo con reinicio automático:

```bash
npm run dev
```

El servidor comienza a escuchar después de establecer la conexión con MongoDB.

Con `PORT=8080`, la dirección base es:

```text
http://localhost:8080
```

La API, las vistas y Socket.IO comparten el mismo servidor HTTP.

## Arquitectura

Las peticiones de la API recorren las siguientes capas:

```text
Router → Controller → Service → Repository → DAO → Modelo de Mongoose
```

| Capa | Responsabilidad |
| --- | --- |
| Router | Define los endpoints y conecta los middlewares con los controllers. |
| Middleware de validación | Valida los datos de la petición con los esquemas de Zod. |
| Controller | Lee los datos validados, llama al service y construye la respuesta HTTP. |
| Service | Aplica las reglas de negocio. |
| Repository | Ofrece métodos de acceso a datos. |
| DAO | Ejecuta las consultas y operaciones de persistencia. |
| Modelo | Define la estructura de los documentos en MongoDB. |

Los esquemas se encuentran en `src/validators/` y el middleware reutilizable en `src/middlewares/`.

Los services, repositories y DAOs no utilizan `req` ni `res`.

Los controllers de vistas utilizan la capa de services. Los manejadores de Socket.IO también acceden a los mensajes a través de su service.

## Organización de archivos

- `src/config/`: configuración de entorno y conexión a MongoDB.
- `src/controllers/`: controllers de servicios, reservas y vistas.
- `src/routes/`: routers de la API y las vistas.
- `src/middlewares/`: middleware de validación.
- `src/validators/`: esquemas de Zod.
- `src/services/`: reglas de negocio.
- `src/repositories/`: acceso a las operaciones de persistencia.
- `src/dao/`: consultas a MongoDB mediante Mongoose.
- `src/models/`: modelos de servicios, reservas y mensajes.
- `src/sockets/`: manejadores de eventos de mensajes.
- `src/views/`: plantillas y layout de Handlebars.
- `src/public/`: estilos y código del navegador.
- `src/app.js`: configuración de Express.
- `src/server.js`: conexión a la base de datos e inicio del servidor.

La persistencia actual utiliza MongoDB. Los archivos JSON y los managers de las primeras entregas fueron reemplazados.

## Recurso services

Cada servicio contiene:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | String | Identificador generado a partir del ObjectId de MongoDB. |
| `name` | String | Nombre del servicio. |
| `description` | String | Descripción. |
| `duration` | Number | Duración en minutos, mayor que cero. |
| `price` | Number | Precio mayor o igual que cero. |
| `category` | String | Categoría. |
| `available` | Boolean | Indica si está disponible. |

Los seis campos de datos son obligatorios al crear un servicio.

Ejemplo de body para `POST /api/services`:

```json
{
  "name": "Consulta general",
  "description": "Consulta inicial para evaluar al cliente",
  "duration": 30,
  "price": 18000,
  "category": "Consultas",
  "available": true
}
```

El cliente no debe enviar el `id`: se genera automáticamente.

`PUT /api/services/:sid` permite actualizar parcialmente los campos:

```json
{
  "price": 20000,
  "available": false
}
```

El identificador no puede modificarse. Los campos desconocidos, incluido un `id` enviado en el body, se descartan durante la validación.

## Endpoints de servicios

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/services` | Listado paginado con filtros y ordenamiento. |
| GET | `/api/services/:sid` | Servicio por identificador. |
| POST | `/api/services` | Creación de un servicio. |
| PUT | `/api/services/:sid` | Actualización de un servicio. |
| DELETE | `/api/services/:sid` | Eliminación de un servicio. |

## Filtros, paginación y ordenamiento

`GET /api/services` acepta los siguientes query params:

| Parámetro | Descripción | Valor predeterminado |
| --- | --- | --- |
| `category` | Filtra por categoría completa, sin distinguir mayúsculas y minúsculas. | Sin filtro |
| `available` | Acepta `true` o `false`, sin distinguir mayúsculas y minúsculas. | Sin filtro |
| `page` | Número entero de página, desde 1. | `1` |
| `limit` | Cantidad de resultados por página, entre 1 y 100. | `10` |
| `sortBy` | Campo utilizado para ordenar. | `id` |
| `order` | Dirección `asc` o `desc`. | `asc` |

Campos permitidos en `sortBy`:

```text
id, name, description, duration, price, category, available
```

Si varios servicios tienen el mismo valor en el campo de ordenamiento, se utiliza su identificador como criterio adicional.

Ejemplos:

```text
GET /api/services
GET /api/services?page=1&limit=2
GET /api/services?category=consultas
GET /api/services?available=true
GET /api/services?sortBy=price&order=desc
GET /api/services?category=pruebas&available=false&page=1&limit=5&sortBy=price&order=desc
```

Los filtros se pueden combinar.

Ejemplo de respuesta:

```json
{
  "services": [
    {
      "id": "6ac4f4ba99fb98cc2986b4d1",
      "name": "Consulta general",
      "description": "Consulta inicial para evaluar al cliente",
      "duration": 30,
      "price": 18000,
      "category": "Consultas",
      "available": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "hasPrevPage": false,
  "hasNextPage": false
}
```

`total` representa la cantidad de servicios que cumplen los filtros antes de aplicar la paginación.

Si no hay coincidencias, la respuesta es `200`, con `services: []`, `total: 0` y `totalPages: 0`.

Si se solicita una página posterior a la última, se devuelve un listado vacío conservando la página solicitada.

Esta entrega cambia la respuesta del listado: el array ahora se encuentra dentro de la propiedad `services`, acompañado por los metadatos.

## Recurso bookings

Cada reserva contiene:

| Campo | Descripción |
| --- | --- |
| `id` | Identificador generado por MongoDB. |
| `clientName` | Nombre del cliente. |
| `clientEmail` | Correo electrónico. |
| `date` | Fecha válida con formato `YYYY-MM-DD`. |
| `time` | Hora válida con formato `HH:mm`. |
| `status` | Estado de la reserva; por defecto, `pending`. |
| `services` | Referencias a servicios y sus cantidades. |

Ejemplo de body para `POST /api/bookings`:

```json
{
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-11-10",
  "time": "16:00",
  "status": "pending",
  "services": []
}
```

`status` puede omitirse y toma el valor `pending`.

`services` puede omitirse o enviarse vacío. Para asociar servicios se utiliza el endpoint específico.

## Endpoints de reservas

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | `/api/bookings` | Creación de una reserva. |
| GET | `/api/bookings/:bid` | Consulta de una reserva con servicios completos. |
| POST | `/api/bookings/:bid/services/:sid` | Asociación de un servicio a una reserva. |

Para asociar un servicio:

```text
POST /api/bookings/ID_RESERVA/services/ID_SERVICIO
```

Esta petición no necesita body. Ambos identificadores deben corresponder a documentos existentes.

Si el servicio ya está asociado, se incrementa `quantity`. Esta regla se implementa en la capa de services.

## Referencias y populate

MongoDB almacena cada servicio de la reserva como una referencia:

```javascript
{
  service: ObjectId("6ac4f4ba99fb98cc2986b4d1"),
  quantity: 2
}
```

El objeto completo del servicio no se guarda dentro de la reserva.

Al consultar:

```text
GET /api/bookings/ID_RESERVA
```

El DAO utiliza `populate` para recuperar la información del servicio asociado.

Ejemplo de respuesta:

```json
{
  "id": "6ad151cc5dc42f39e72f649a",
  "clientName": "Cliente de prueba",
  "clientEmail": "cliente@example.com",
  "date": "2026-11-10",
  "time": "16:00",
  "status": "pending",
  "services": [
    {
      "service": {
        "id": "6ac4f4ba99fb98cc2986b4d1",
        "name": "Consulta general",
        "description": "Consulta inicial para evaluar al cliente",
        "duration": 30,
        "price": 18000,
        "category": "Consultas",
        "available": true
      },
      "quantity": 2
    }
  ]
}
```

Los identificadores de los ejemplos deben reemplazarse por los de la base de datos utilizada.

`populate` se aplica a la consulta de la reserva. Las operaciones de creación y asociación conservan las referencias y no guardan los objetos completos.

Si un servicio asociado fue eliminado, su referencia se muestra como `null` en la consulta poblada.

## Validación con Zod

Se validan las siguientes operaciones antes de acceder a MongoDB:

- Crear servicios.
- Actualizar servicios.
- Crear reservas.
- Agregar servicios a reservas.
- Consultar servicios con filtros, paginación y ordenamiento.
- Validar los identificadores utilizados en las rutas de servicios y reservas.

Las validaciones controlan:

- Campos obligatorios.
- Textos no vacíos.
- Tipos de datos.
- Duración positiva y precio no negativo.
- Disponibilidad como booleano real.
- Formato de correo electrónico.
- Fechas y horas válidas.
- Identificadores de 24 caracteres hexadecimales.
- Valores permitidos en filtros y ordenamiento.
- Parámetros de paginación.

En el body, `available` debe ser `true` o `false`, sin comillas. Los campos numéricos también deben enviarse como números.

En los query params, los valores llegan como texto y el esquema los transforma cuando corresponde.

Los datos inválidos reciben `400 Bad Request`, con un mensaje y el detalle de los campos afectados.

Las validaciones de Mongoose y los controles de negocio complementan esta validación de entrada.

## Códigos HTTP

| Código | Uso |
| --- | --- |
| `200` | Consulta, actualización, eliminación o asociación exitosa. |
| `201` | Servicio o reserva creados. |
| `400` | Datos, parámetros o identificadores inválidos. |
| `404` | Identificador válido que no corresponde a un recurso existente. |
| `500` | Error interno al procesar la operación. |

Los errores de entrada se diferencian de los errores internos. Los detalles técnicos de los errores internos se registran en la consola del servidor.

## Vistas con Handlebars

| Ruta | Contenido |
| --- | --- |
| `/views/services` | Todos los servicios. |
| `/views/availability` | Servicios con `available: true`. |
| `/views/messages` | Historial y formulario de mensajes. |

Las vistas utilizan datos reales de MongoDB, obtenidos mediante la arquitectura en capas.

La vista de disponibilidad muestra servicios habilitados. No representa horarios libres ni comprueba superposición de turnos.

## Servicios en tiempo real

Al crear, actualizar o eliminar un servicio mediante la API, el servidor emite:

```text
services:changed
```

El navegador escucha el evento y consulta nuevamente la API para actualizar el listado sin recargar la página.

Las vistas mantienen el listado completo: el código del navegador recorre las páginas de la API cuando es necesario.

Cambiar `available` actualiza tanto el estado mostrado en la vista general como la presencia del servicio en la vista de disponibilidad.

## Mensajes persistentes y Socket.IO

La entidad `messages` se incorporó en la entrega 7 para practicar persistencia de mensajes en MongoDB y comunicación en tiempo real con Socket.IO, aplicando lo visto en la clase del 28 de septiembre del módulo 6. En la entrega 6, el docente había autorizado omitirla debido a una inconsistencia en la consigna.

Cada mensaje contiene:

- `id`: identificador generado por MongoDB.
- `author`: nombre indicado por quien envía el mensaje.
- `text`: contenido.
- `createdAt`: fecha de creación.

El autor admite hasta 100 caracteres y el texto hasta 1000. Ambos deben ser textos no vacíos.

Los mensajes se guardan en MongoDB antes de notificarse a los clientes conectados.

| Evento | Función |
| --- | --- |
| `messages:list` | Solicita el historial. |
| `messages:create` | Solicita guardar un mensaje. |
| `messages:created` | Notifica un mensaje guardado a los clientes. |

Las solicitudes de Socket.IO utilizan respuestas de confirmación. No utilizan códigos HTTP como los endpoints REST.

El cliente recupera el historial al conectarse y evita mostrar mensajes duplicados por identificador.

El contenido se muestra como texto, sin interpretar HTML ingresado por el usuario.

El nombre del autor es un dato del formulario; no representa una identidad autenticada.

## Pruebas manuales

Las comprobaciones pueden realizarse con Postman y el navegador, manteniendo el servidor en ejecución.

### API y validaciones

1. Crear un servicio válido y comprobar el código `201`.
2. Consultarlo por su identificador.
3. Actualizar su precio o disponibilidad.
4. Comprobar que el identificador no pueda modificarse.
5. Enviar campos incompletos o de tipos incorrectos y verificar `400`.
6. Consultar un identificador válido inexistente y verificar `404`.
7. Eliminar un servicio de prueba.

### Consultas avanzadas

1. Crear varios servicios con precios y categorías diferentes.
2. Consultar con `page` y `limit`.
3. Comprobar el listado y los metadatos de cada página.
4. Ordenar por precio en ambos sentidos.
5. Combinar los filtros de categoría y disponibilidad.
6. Consultar un filtro sin coincidencias.
7. Enviar parámetros inválidos, como `page=0` o un `sortBy` no permitido, y verificar `400`.

### Reservas y populate

1. Crear una reserva y comprobar el código `201`.
2. Asociar un servicio existente.
3. Asociarlo nuevamente y comprobar `quantity: 2`.
4. Consultar la reserva y verificar los datos completos del servicio.
5. Revisar en Atlas que la reserva almacene el ObjectId y la cantidad.
6. Intentar asociar un recurso inexistente y comprobar `404`.
7. Enviar identificadores malformados y comprobar `400`.

### Persistencia, vistas y tiempo real

1. Reiniciar el servidor y comprobar que los datos permanezcan.
2. Abrir las vistas de servicios y disponibilidad.
3. Crear, actualizar y eliminar un servicio mediante la API.
4. Comprobar los cambios sin recargar las vistas.
5. Cambiar `available` y comprobar la actualización de ambos listados.
6. Abrir el chat en dos pestañas y enviar un mensaje.
7. Verificar que aparezca en ambas.
8. Recargar el chat y comprobar que el historial permanezca.

Estas pruebas son manuales. El proyecto no incluye una suite de tests automatizados.

## Alcance actual

- No incluye autenticación ni autorización.
- No valida conflictos de horarios entre reservas.
- La disponibilidad del servicio no representa una agenda de turnos.
- El chat es compartido y su historial no está paginado.
- No se implementaron endpoints para actualizar o eliminar reservas.
- Eliminar un servicio no elimina sus referencias en reservas existentes.
- Los cambios realizados directamente en Atlas no emiten eventos de Socket.IO.
- La actualización de cantidades no incorpora todavía un mecanismo específico para resolver solicitudes simultáneas.

## Autor

Franco Dominici