import * as servicesRepository from "../repositories/services.repository.js";

const requiredFields = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available"
];

/* Obtener servicios y aplicar filtros */
export async function getServices(filters = {}) {
  const { category, available } = filters;

  let availableValue;

  if (available !== undefined) {
    const availableFilter = String(available).toLowerCase();

    if (
      availableFilter !== "true" &&
      availableFilter !== "false"
    ) {
      throw validationError("available debe ser true o false");
    }

    availableValue = availableFilter === "true";
  }

  let services = await servicesRepository.getAll();

  if (category !== undefined) {
    const categoryFilter = String(category).toLowerCase();

    services = services.filter((service) => {
      return service.category.toLowerCase() === categoryFilter;
    });
  }

  if (available !== undefined) {
    services = services.filter((service) => {
      return service.available === availableValue;
    });
  }

  return services;
}

/* Obtener un servicio por ID */
export async function getServiceById(id) {
  return servicesRepository.getById(id);
}

/* Validar y crear un servicio */
export async function createService(serviceData) {
  validateServiceData(serviceData);

  const newService = {
    name: serviceData.name.trim(),
    description: serviceData.description.trim(),
    duration: serviceData.duration,
    price: serviceData.price,
    category: serviceData.category.trim(),
    available: serviceData.available
  };

  return servicesRepository.create(newService);
}

/* Validar y actualizar un servicio */
export async function updateService(id, updatedData) {
  const currentService = await servicesRepository.getById(id);

  if (currentService === null) {
    return null;
  }

  validateObject(updatedData);

  /* Excluir el ID enviado por el cliente */
  const { id: ignoredId, ...allowedUpdates } = updatedData;

  const updatedService = {
    ...currentService,
    ...allowedUpdates,
    id: currentService.id
  };

  validateServiceData(updatedService);

  updatedService.name = updatedService.name.trim();
  updatedService.description = updatedService.description.trim();
  updatedService.category = updatedService.category.trim();

  return servicesRepository.update(id, updatedService);
}

/* Eliminar un servicio */
export async function deleteService(id) {
  return servicesRepository.delete(id);
}

/* Comprobar que los datos sean un objeto */
function validateObject(serviceData) {
  if (
    !serviceData ||
    typeof serviceData !== "object" ||
    Array.isArray(serviceData)
  ) {
    throw validationError(
      "Los datos del servicio deben ser un objeto"
    );
  }
}

/* Validar los campos y sus valores */
function validateServiceData(serviceData) {
  validateObject(serviceData);

  const missingFields = requiredFields.filter((field) => {
    return (
      !Object.hasOwn(serviceData, field) ||
      serviceData[field] === undefined ||
      serviceData[field] === null ||
      (
        typeof serviceData[field] === "string" &&
        serviceData[field].trim() === ""
      )
    );
  });

  if (missingFields.length > 0) {
    throw validationError(
      `Faltan campos requeridos: ${missingFields.join(", ")}`
    );
  }

  if (
    typeof serviceData.name !== "string" ||
    typeof serviceData.description !== "string" ||
    typeof serviceData.category !== "string"
  ) {
    throw validationError(
      "name, description y category deben ser textos"
    );
  }

  if (
    typeof serviceData.duration !== "number" ||
    !Number.isFinite(serviceData.duration) ||
    serviceData.duration <= 0
  ) {
    throw validationError(
      "duration debe ser un número mayor que cero"
    );
  }

  if (
    typeof serviceData.price !== "number" ||
    !Number.isFinite(serviceData.price) ||
    serviceData.price < 0
  ) {
    throw validationError(
      "price debe ser un número mayor o igual que cero"
    );
  }

  if (typeof serviceData.available !== "boolean") {
    throw validationError(
      "available debe ser un valor booleano"
    );
  }
}

/* Identificar los errores de validación */
function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;

  return error;
}