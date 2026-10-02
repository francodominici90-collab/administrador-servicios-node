import { readFile, writeFile } from "node:fs/promises";

const servicesFile = new URL(
  "../data/services.json",
  import.meta.url
);

/* Leer los servicios del archivo */
export async function getAll() {
  const content = await readFile(servicesFile, "utf-8");
  const services = JSON.parse(content);

  if (!Array.isArray(services)) {
    throw new Error(
      "El archivo services.json debe contener un array"
    );
  }

  return services;
}

/* Buscar un servicio por ID */
export async function getById(id) {
  const services = await getAll();

  return services.find((service) => {
    return service.id === Number(id);
  }) ?? null;
}

/* Guardar un nuevo servicio con ID generado */
export async function create(serviceData) {
  const services = await getAll();

  const lastId = services.reduce((highestId, service) => {
    return Math.max(highestId, service.id);
  }, 0);

  const newService = {
    ...serviceData,
    id: lastId + 1
  };

  services.push(newService);

  await saveAll(services);

  return newService;
}

/* Actualizar un registro existente */
export async function update(id, updatedData) {
  const services = await getAll();

  const serviceIndex = services.findIndex((service) => {
    return service.id === Number(id);
  });

  if (serviceIndex === -1) {
    return null;
  }

  const updatedService = {
    ...services[serviceIndex],
    ...updatedData,
    id: services[serviceIndex].id
  };

  services[serviceIndex] = updatedService;

  await saveAll(services);

  return updatedService;
}

/* Eliminar un registro existente */
async function deleteById(id) {
  const services = await getAll();

  const serviceIndex = services.findIndex((service) => {
    return service.id === Number(id);
  });

  if (serviceIndex === -1) {
    return null;
  }

  const [deletedService] = services.splice(serviceIndex, 1);

  await saveAll(services);

  return deletedService;
}

/* Escribir el array completo en el archivo */
async function saveAll(services) {
  const content = JSON.stringify(services, null, 2);

  await writeFile(
    servicesFile,
    `${content}\n`,
    "utf-8"
  );
}

export { deleteById as delete };