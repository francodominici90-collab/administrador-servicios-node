import { readFile, writeFile } from "node:fs/promises";

const servicesFile = new URL(
  "../data/services.json",
  import.meta.url
);

const requiredFields = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available"
];

class ServiceManager {
  constructor(filePath = servicesFile) {
    this.filePath = filePath;
  }

  async getServices() {
    const fileContent = await readFile(this.filePath, "utf-8");
    const services = JSON.parse(fileContent);

    if (!Array.isArray(services)) {
      throw new Error(
        "El archivo services.json debe contener un array"
      );
    }

    return services;
  }

  async getServiceById(id) {
    const services = await this.getServices();
    const serviceId = Number(id);

    const service = services.find(
      (currentService) => currentService.id === serviceId
    );

    return service ?? null;
  }

  async addService(serviceData) {
    this.#validateServiceData(serviceData);

    const services = await this.getServices();

    const lastId = services.reduce((highestId, service) => {
      return Math.max(highestId, service.id);
    }, 0);

    const newService = {
      id: lastId + 1,
      name: serviceData.name.trim(),
      description: serviceData.description.trim(),
      duration: serviceData.duration,
      price: serviceData.price,
      category: serviceData.category.trim(),
      available: serviceData.available
    };

    services.push(newService);

    await this.#saveServices(services);

    return newService;
  }

  async updateService(id, updatedData) {
    const services = await this.getServices();
    const serviceId = Number(id);

    const serviceIndex = services.findIndex(
      (service) => service.id === serviceId
    );

    if (serviceIndex === -1) {
      return null;
    }

    const { id: ignoredId, ...allowedUpdates } = updatedData;

    const updatedService = {
      ...services[serviceIndex],
      ...allowedUpdates,
      id: services[serviceIndex].id
    };

    this.#validateServiceData(updatedService);

    updatedService.name = updatedService.name.trim();
    updatedService.description =
      updatedService.description.trim();
    updatedService.category =
      updatedService.category.trim();

    services[serviceIndex] = updatedService;

    await this.#saveServices(services);

    return updatedService;
  }

  async deleteService(id) {
    const services = await this.getServices();
    const serviceId = Number(id);

    const serviceIndex = services.findIndex(
      (service) => service.id === serviceId
    );

    if (serviceIndex === -1) {
      return null;
    }

    const [deletedService] = services.splice(serviceIndex, 1);

    await this.#saveServices(services);

    return deletedService;
  }

  #validateServiceData(serviceData) {
    if (
      !serviceData ||
      typeof serviceData !== "object" ||
      Array.isArray(serviceData)
    ) {
      throw new TypeError(
        "Los datos del servicio deben ser un objeto"
      );
    }

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
      throw new Error(
        `Faltan campos requeridos: ${missingFields.join(", ")}`
      );
    }

    if (
      typeof serviceData.name !== "string" ||
      typeof serviceData.description !== "string" ||
      typeof serviceData.category !== "string"
    ) {
      throw new TypeError(
        "name, description y category deben ser textos"
      );
    }

    if (
      typeof serviceData.duration !== "number" ||
      !Number.isFinite(serviceData.duration) ||
      serviceData.duration <= 0
    ) {
      throw new TypeError(
        "duration debe ser un número mayor que cero"
      );
    }

    if (
      typeof serviceData.price !== "number" ||
      !Number.isFinite(serviceData.price) ||
      serviceData.price < 0
    ) {
      throw new TypeError(
        "price debe ser un número mayor o igual que cero"
      );
    }

    if (typeof serviceData.available !== "boolean") {
      throw new TypeError(
        "available debe ser un valor booleano"
      );
    }
  }

  async #saveServices(services) {
    const jsonContent = JSON.stringify(services, null, 2);

    await writeFile(
      this.filePath,
      `${jsonContent}\n`,
      "utf-8"
    );
  }
}

export { ServiceManager };
export default ServiceManager;