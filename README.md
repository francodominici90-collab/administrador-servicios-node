# Administrador de servicios

Proyecto desarrollado con Node.js para administrar los servicios de un sistema de turnos y reservas.

La clase `ServiceManager` permite consultar, agregar, actualizar y eliminar servicios almacenados en un archivo JSON.

## Tecnologías utilizadas

- Node.js
- JavaScript
- ECMAScript Modules (ESM)
- dotenv
- Persistencia mediante JSON

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Ingresar en la carpeta del proyecto:

```bash
cd CODIGO_CLASE_1
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=8080
NODE_ENV=development
```

También se incluye el archivo `.env.example` como referencia:

```env
PORT=
NODE_ENV=
```

El archivo `.env` no se incluye en el repositorio porque se encuentra declarado en `.gitignore`.

## Ejecución

Para iniciar normalmente la aplicación:

```bash
npm start
```

Para iniciar en modo desarrollo con reinicio automático:

```bash
npm run dev
```

## Recurso `services`

Cada servicio contiene las siguientes propiedades:

```js
{
  id: 1,
  name: "Consulta general",
  description: "Consulta inicial para evaluar al cliente",
  duration: 30,
  price: 15000,
  category: "Consultas",
  available: true
}
```

- `id`: identificador generado automáticamente.
- `name`: nombre del servicio.
- `description`: descripción del servicio.
- `duration`: duración del servicio en minutos.
- `price`: precio del servicio.
- `category`: categoría a la que pertenece.
- `available`: indica si el servicio se encuentra disponible.

Los servicios se almacenan en:

```text
src/data/services.json
```

## Uso de ServiceManager

Primero se importa y se crea una instancia:

```js
import ServiceManager from "./src/managers/ServiceManager.js";

const serviceManager = new ServiceManager();
```

### Obtener todos los servicios

```js
const services = await serviceManager.getServices();

console.log(services);
```

### Buscar un servicio por ID

```js
const service = await serviceManager.getServiceById(1);

if (service === null) {
  console.log("Servicio no encontrado");
} else {
  console.log(service);
}
```

### Agregar un servicio

El ID no se envía porque es generado automáticamente por `ServiceManager`.

```js
const newService = await serviceManager.addService({
  name: "Consulta general",
  description: "Consulta inicial para evaluar al cliente",
  duration: 30,
  price: 15000,
  category: "Consultas",
  available: true
});

console.log(newService);
```

### Actualizar un servicio

Se envía el ID del servicio y los campos que se desean modificar.

```js
const updatedService = await serviceManager.updateService(1, {
  price: 18000,
  available: false
});

if (updatedService === null) {
  console.log("Servicio no encontrado");
} else {
  console.log(updatedService);
}
```

El método no permite modificar el ID original del servicio.

### Eliminar un servicio

```js
const deletedService = await serviceManager.deleteService(1);

if (deletedService === null) {
  console.log("Servicio no encontrado");
} else {
  console.log(deletedService);
}
```

## Validaciones

Para agregar un servicio son obligatorios los siguientes campos:

- `name`
- `description`
- `duration`
- `price`
- `category`
- `available`

Si falta alguno de estos campos, `ServiceManager` produce un error descriptivo.

Los métodos `getServiceById()`, `updateService()` y `deleteService()` devuelven `null` cuando el servicio indicado no existe.

## Estructura principal

```text
CODIGO_CLASE_1/
├── src/
│   ├── config/
│   │   └── env.config.js
│   ├── data/
│   │   └── services.json
│   ├── managers/
│   │   └── ServiceManager.js
│   └── app.js
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Autor

Franco Dominici