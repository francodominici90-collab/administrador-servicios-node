import * as servicesService from "../services/services.service.js";

/* Obtener servicios y enviar los filtros al service */
export async function getServices(req, res) {
  try {
    const { category, available } = req.query;

    const services = await servicesService.getServices({
      category,
      available
    });

    return res.status(200).json(services);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: "No se pudieron obtener los servicios",
      detail: error.message
    });
  }
}

/* Obtener un servicio por ID */
export async function getServiceById(req, res) {
  try {
    const { sid } = req.params;

    const service = await servicesService.getServiceById(sid);

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
    const service = await servicesService.createService(req.body);

    return res.status(201).json(service);
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

    const service = await servicesService.updateService(
      sid,
      req.body
    );

    if (service === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(service);
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

    const service = await servicesService.deleteService(sid);

    if (service === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo eliminar el servicio",
      detail: error.message
    });
  }
}