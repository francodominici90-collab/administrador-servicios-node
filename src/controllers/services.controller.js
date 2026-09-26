import ServiceManager from "../managers/ServiceManager.js";

const serviceManager = new ServiceManager();

/* Obtener todos los servicios y aplicar filtros */
export async function getServices(req, res) {
  try {
    let services = await serviceManager.getServices();

    const { category, available } = req.query;

    if (category !== undefined) {
      const categoryFilter = String(category).toLowerCase();

      services = services.filter((service) => {
        return service.category.toLowerCase() === categoryFilter;
      });
    }

    if (available !== undefined) {
      const availableFilter = String(available).toLowerCase();

      if (
        availableFilter !== "true" &&
        availableFilter !== "false"
      ) {
        return res.status(400).json({
          error: "available debe ser true o false"
        });
      }

      const availableValue = availableFilter === "true";

      services = services.filter((service) => {
        return service.available === availableValue;
      });
    }

    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({
      error: "No se pudieron obtener los servicios",
      detail: error.message
    });
  }
}

/* Obtener un servicio por su ID */
export async function getServiceById(req, res) {
  try {
    const { sid } = req.params;

    const service = await serviceManager.getServiceById(sid);

    if (service === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo obtener el servicio",
      detail: error.message
    });
  }
}

/* Crear un servicio */
export async function createService(req, res) {
  try {
    const newService = await serviceManager.addService(req.body);

    return res.status(201).json(newService);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

/* Actualizar un servicio */
export async function updateService(req, res) {
  try {
    const { sid } = req.params;

    const updatedService = await serviceManager.updateService(
      sid,
      req.body
    );

    if (updatedService === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

/* Eliminar un servicio */
export async function deleteService(req, res) {
  try {
    const { sid } = req.params;

    const deletedService = await serviceManager.deleteService(sid);

    if (deletedService === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(deletedService);
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo eliminar el servicio",
      detail: error.message
    });
  }
}