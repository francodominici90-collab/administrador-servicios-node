# Administrador de servicios y reservas

Proyecto desarrollado durante el curso de Backend para gestionar servicios y reservas mediante una API REST.

Utiliza Node.js, Express y MongoDB Atlas con Mongoose. Incorpora vistas renderizadas con Handlebars y actualizaciones en tiempo real mediante Socket.IO.

## Funcionalidades

- Crear, consultar, actualizar y eliminar servicios.
- Filtrar servicios por categoría y disponibilidad.
- Crear reservas y consultar una reserva por su identificador.
- Agregar servicios a una reserva.
- Incrementar la cantidad cuando se agrega nuevamente el mismo servicio.
- Mostrar servicios y disponibilidad mediante vistas Handlebars.
- Actualizar las vistas cuando se crea, modifica o elimina un servicio.
- Enviar mensajes de chat en tiempo real y guardarlos en MongoDB.

## Tecnologías

- Node.js con módulos ESM.
- Express.
- MongoDB Atlas.
- Mongoose.
- dotenv.
- express-handlebars.
- Socket.IO.
- HTML, CSS y JavaScript del navegador.

## Requisitos

- Node.js 24.
- npm.
- Git.
- Un clúster de MongoDB Atlas.
- Un usuario de base de datos con acceso al clúster.
- La dirección IP de conexión habilitada en Atlas.

La cuenta de acceso a la plataforma Atlas y el usuario de la base de datos son credenciales diferentes.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/francodominici90-collab/administrador-servicios-node.git
```

Ingresar a la carpeta:

```bash
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

Completar las variables antes de iniciar la aplicación.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor HTTP. |
| `NODE_ENV` | Entorno de ejecución. |
| `MONGO_URI` | URI de conexión a MongoDB Atlas. |

Ejemplo de configuración local:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@HOST_DEL_CLUSTER/turnos_reservas?retryWrites=true&w=majority
```

La URI es ilustrativa: se debe utilizar la cadena proporcionada por Atlas, con el usuario, contraseña y nombre de base de datos correspondientes.

Los caracteres especiales de las credenciales deben codificarse correctamente para utilizarlos en una URI.

El archivo `.env.example` contiene las variables sin valores:

```env
PORT=
NODE_ENV=
MONGO_URI=
```

La configuración valida la presencia de las variables requeridas y que `PORT` sea un entero entre 1 y 65535.

El archivo `.env` y la carpeta `node_modules/` están excluidos mediante `.gitignore`.

## Ejecución

Iniciar la aplicación:

```bash
npm start
```

Ejecutar en modo de desarrollo con reinicio ante cambios:

```bash
npm run dev
```

La aplicación se conecta a MongoDB antes de comenzar a escuchar peticiones.

Con `PORT=8080`, la dirección local es:

```text
http://localhost:8080
```

Express y Socket.IO comparten el mismo servidor HTTP y puerto.

## Arquitectura

La API mantiene el siguiente flujo:

```text
Router → Controller → Service → Repository → DAO → Modelo Mongoose → MongoDB
```

| Capa | Responsabilidad |
|---|---|
| Routes | Define las rutas y las vincula con sus controllers. |
| Controllers | Lee la petición, llama al service y construye la respuesta. |
| Services | Aplica validaciones y reglas de negocio. |
| Repositories | Ofrece métodos de acceso a datos y delega en los DAO. |
| DAO | Realiza las operaciones de persistencia mediante Mongoose. |
| Models | Define los esquemas de los documentos de MongoDB. |

Los services, repositories y DAO no utilizan `req` ni `res`.

Las vistas consultan los mismos services que utiliza la API. Los controllers de vistas no acceden directamente a MongoDB.

Los eventos del chat ingresan por `messages.socket.js`, que llama al service de mensajes. La validación y la persistencia conservan sus capas correspondientes.

## Estructura principal

```text
src/
├── config/
│   ├── db.config.js
│   └── env.config.js
├── controllers/
│   ├── bookings.controller.js
│   ├── services.controller.js
│   └── views.controller.js
├── dao/
│   ├── bookings.dao.js
│   ├── messages.dao.js
│   └── services.dao.js
├── models/
│   ├── booking.model.js
│   ├── message.model.js
│   └── service.model.js
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── socket.js
├── repositories/
│   ├── bookings.repository.js
│   ├── messages.repository.js
│   └── services.repository.js
├── routes/
│   ├── bookings.router.js
│   ├── services.router.js
│   └── views.router.js
├── services/
│   ├── bookings.service.js
│   ├── messages.service.js
│   └── services.service.js
├── sockets/
│   └── messages.socket.js
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── availability.handlebars
│   ├── messages.handlebars
│   └── services.handlebars
├── app.js
└── server.js
.env.example
.gitignore
package-lock.json
package.json
README.md
```

## Persistencia e identificadores

Los datos se almacenan en MongoDB. Los archivos JSON y los managers de las primeras entregas fueron reemplazados en etapas anteriores.

MongoDB genera los identificadores automáticamente. La API expone el identificador como `id`, representado mediante una cadena de texto.

Las referencias a servicios dentro de las reservas se almacenan como `ObjectId` y se presentan como cadenas en las respuestas.

Los datos de una base de datos local o de Atlas no forman parte del repositorio. Una base nueva puede comenzar sin servicios, reservas ni mensajes.

## Recurso services

Cada servicio contiene:

| Campo | Descripción |
|---|---|
| `id` | Identificador generado automáticamente. |
| `name` | Nombre del servicio. |
| `description` | Descripción. |
| `duration` | Duración en minutos. |
| `price` | Precio. |
| `category` | Categoría. |
| `available` | Disponibilidad del servicio. |

Para crear un servicio se requieren los seis campos de datos.

- `name`, `description` y `category` deben ser textos no vacíos.
- `duration` debe ser un número finito mayor que cero.
- `price` debe ser un número finito mayor o igual que cero.
- `available` debe ser un booleano.
- El identificador se genera internamente y no puede modificarse.

Ejemplo de body para crear un servicio:

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

Ejemplo de actualización parcial:

```json
{
  "price": 18000,
  "available": false
}
```

## Recurso bookings

Cada reserva contiene:

| Campo | Descripción |
|---|---|
| `id` | Identificador generado automáticamente. |
| `clientName` | Nombre del cliente. |
| `clientEmail` | Correo del cliente. |
| `date` | Fecha con formato `YYYY-MM-DD`. |
| `time` | Hora con formato `HH:mm`. |
| `status` | Estado de la reserva. |
| `services` | Referencias a servicios y sus cantidades. |

Ejemplo de body para crear una reserva:

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

Se validan los datos obligatorios, el formato del correo, la fecha y la hora.

Si se omite `status`, se utiliza `pending`.

La reserva se crea sin servicios asociados. Los servicios se agregan mediante el endpoint correspondiente.

Dentro de una reserva, cada elemento tiene esta forma:

```json
{
  "service": "OBJECT_ID_DEL_SERVICIO",
  "quantity": 1
}
```

Antes de agregar un servicio se comprueba que existan tanto la reserva como el servicio.

Si el servicio ya está asociado, se incrementa `quantity`. Esta regla se encuentra en `bookings.service.js`.

## Endpoints REST

| Método | Ruta | Comportamiento |
|---|---|---|
| GET | `/api/services` | Lista los servicios y admite filtros. |
| GET | `/api/services/:sid` | Obtiene un servicio por ID. |
| POST | `/api/services` | Crea un servicio. |
| PUT | `/api/services/:sid` | Actualiza un servicio existente. |
| DELETE | `/api/services/:sid` | Elimina un servicio. |
| POST | `/api/bookings` | Crea una reserva. |
| GET | `/api/bookings/:bid` | Obtiene una reserva por ID. |
| POST | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva. |

Los parámetros `:sid` y `:bid` deben reemplazarse por identificadores reales.

Las peticiones POST y PUT que envían un body JSON deben utilizar:

```text
Content-Type: application/json
```

En Postman se configura mediante `Body → raw → JSON`.

### Filtros de servicios

Por categoría:

```text
GET /api/services?category=consultas
```

Por disponibilidad:

```text
GET /api/services?available=true
```

Filtros combinados:

```text
GET /api/services?category=consultas&available=true
```

La categoría se compara sin distinguir mayúsculas y minúsculas.

El filtro `available` admite `true` o `false`, sin distinguir mayúsculas y minúsculas. Un valor inválido produce una respuesta 400.

Si no hay coincidencias, se devuelve un array vacío.

### Códigos HTTP

| Código | Significado |
|---|---|
| 200 | Consulta, actualización, eliminación o asociación exitosa. |
| 201 | Servicio o reserva creados. |
| 400 | Datos o filtros inválidos. |
| 404 | Servicio o reserva no encontrados. |
| 500 | Falla interna del servidor o de persistencia. |

Las consultas de recursos con identificadores que no tienen un formato ObjectId válido se tratan como recursos no encontrados.

Los errores de validación se diferencian de las fallas internas. Estas últimas se registran en el servidor y devuelven un mensaje general al cliente.

## Vistas con Handlebars

| Ruta | Contenido |
|---|---|
| `/views/services` | Todos los servicios registrados. |
| `/views/availability` | Servicios cuyo campo `available` es `true`. |
| `/views/messages` | Historial del chat y formulario de envío. |

Las vistas utilizan datos obtenidos desde MongoDB a través de las capas de la aplicación.

El layout `main.handlebars` comparte la navegación, los estilos y los scripts.

La vista de disponibilidad muestra servicios habilitados. No calcula horarios libres ni verifica superposiciones de reservas.

## Actualización de servicios en tiempo real

Después de crear, actualizar o eliminar correctamente un servicio, el controller emite:

```text
services:changed
```

El navegador escucha el evento y consulta nuevamente la API REST.

- La vista de servicios consulta `/api/services`.
- La vista de disponibilidad consulta `/api/services?available=true`.

El listado y su contador se actualizan sin recargar la página.

Al conectar o reconectar Socket.IO, las vistas también consultan la API para recuperar el estado actual.

Si una consulta falla, se conserva el listado anterior y se muestra un aviso.

La carga inicial sigue siendo renderizada por Handlebars; JavaScript realiza las actualizaciones posteriores.

## Chat y recurso messages

El chat se incorporó como una ampliación voluntaria.

En la entrega anterior, el docente indicó que la entidad `messages` podía omitirse debido a una inconsistencia en la consigna. En esta etapa se agregó para practicar persistencia de mensajes y comunicación en tiempo real.

Cada mensaje contiene:

| Campo | Descripción |
|---|---|
| `id` | Identificador generado por MongoDB. |
| `author` | Nombre escrito por quien envía el mensaje. |
| `text` | Contenido del mensaje. |
| `createdAt` | Fecha de creación generada en el servidor. |

Se definieron los siguientes límites para esta ampliación:

- Autor obligatorio, con un máximo de 100 caracteres.
- Texto obligatorio, con un máximo de 1000 caracteres.
- No se aceptan valores compuestos únicamente por espacios.

El nombre del autor es ingresado libremente y no representa una cuenta autenticada.

### Eventos del chat

| Evento | Dirección | Función |
|---|---|---|
| `messages:list` | Cliente → servidor | Solicita el historial persistido. |
| `messages:create` | Cliente → servidor | Solicita guardar un mensaje. |
| `messages:created` | Servidor → clientes | Comunica un mensaje guardado correctamente. |

El servidor valida y guarda el mensaje antes de emitir `messages:created`.

Las solicitudes del cliente reciben una confirmación con `ok: true` o un resultado de error con `ok: false`.

Estas confirmaciones pertenecen a Socket.IO; no son códigos de estado HTTP.

El cliente evita mostrar mensajes duplicados por ID y solicita el historial al reconectarse.

Si no llega una confirmación de envío dentro del tiempo esperado, se informa al usuario. El mensaje no se reenvía automáticamente, porque podría haberse guardado aunque la confirmación no haya llegado.

El chat utiliza Socket.IO para enviar mensajes; no incorpora endpoints REST de mensajes.

### Representación del contenido

Handlebars utiliza expresiones escapadas para mostrar los datos de los usuarios.

Las actualizaciones del navegador utilizan `textContent` para representar nombres, descripciones y mensajes como texto.

## Pruebas manuales

Las pruebas se realizan con Postman y un navegador.

### API REST

1. Crear un servicio con un POST válido y comprobar la respuesta 201.
2. Consultar el listado y el servicio por ID.
3. Probar los filtros por categoría y disponibilidad.
4. Actualizar precio o disponibilidad mediante PUT.
5. Comprobar que el ID del servicio se conserve.
6. Enviar datos incompletos y comprobar la respuesta 400.
7. Consultar un ID inexistente y comprobar la respuesta 404.
8. Crear una reserva y comprobar la respuesta 201.
9. Agregar un servicio a la reserva.
10. Agregarlo nuevamente y comprobar que aumente `quantity`.
11. Intentar asociar un servicio inexistente y comprobar la respuesta 404.
12. Eliminar el servicio temporal utilizado en las pruebas.

### Vistas y servicios en tiempo real

1. Abrir `/views/services` y `/views/availability` en dos pestañas.
2. Crear desde Postman un servicio temporal con `available: true`.
3. Comprobar que aparezca en ambas vistas sin recargar.
4. Actualizarlo mediante PUT con `available: false`.
5. Comprobar que siga en el listado general como no disponible.
6. Comprobar que desaparezca de la vista de disponibilidad.
7. Volver a establecer `available: true`.
8. Comprobar que reaparezca en disponibilidad.
9. Eliminar el servicio temporal.
10. Comprobar que desaparezca de ambas vistas y se actualicen los contadores.

### Chat

1. Abrir `/views/messages` en dos pestañas.
2. Esperar el estado de conexión y la habilitación del botón.
3. Enviar un mensaje desde una pestaña.
4. Comprobar que aparezca en ambas sin recargar.
5. Recargar una pestaña y comprobar que el mensaje continúe en el historial.

Las pruebas de creación, actualización y eliminación en tiempo real, junto con el envío y persistencia del chat, se verificaron manualmente durante el desarrollo.

El proyecto no incorpora todavía una suite de tests automatizados.

## Alcance y limitaciones

- No hay autenticación ni autorización.
- El chat es compartido y los autores no tienen identidad verificada.
- El historial del chat se obtiene completo, sin paginación.
- No se calcula disponibilidad por fecha y horario.
- No se bloquean reservas superpuestas.
- La asociación de servicios a reservas valida su existencia, pero no exige que estén disponibles.
- Eliminar un servicio no elimina sus referencias en reservas anteriores.
- No se incluyen endpoints para actualizar o eliminar reservas.
- La actualización de cantidades en reservas no utiliza todavía una operación atómica para solicitudes concurrentes.
- Los eventos de servicios corresponden a cambios realizados mediante esta API. Las modificaciones directas en Atlas no generan esos eventos.
- La configuración de Socket.IO corresponde a una única instancia del servidor.

## Autor

Franco Dominici