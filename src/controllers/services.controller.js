import * as servicesService from "../services/services.service.js";

export async function getServices(req, res) {
  try {
    const { category, available } = req.query;

    const services = await servicesService.getServices({
      category,
      available
    });

    return res.status(200).json(services);
  } catch (error) {
    return handleError(error, res, "No se pudieron obtener los servicios");
  }
}

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
    return handleError(error, res, "No se pudo obtener el servicio");
  }
}

export async function createService(req, res) {
  try {
    const service = await servicesService.createService(req.body);

    return res.status(201).json(service);
  } catch (error) {
    return handleError(error, res, "No se pudo crear el servicio");
  }
}

export async function updateService(req, res) {
  try {
    const { sid } = req.params;
    const service = await servicesService.updateService(sid, req.body);

    if (service === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    return res.status(200).json(service);
  } catch (error) {
    return handleError(error, res, "No se pudo actualizar el servicio");
  }
}

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
    return handleError(error, res, "No se pudo eliminar el servicio");
  }
}

function handleError(error, res, fallbackMessage) {
  if (error.statusCode === 400 || error.name === "ValidationError") {
    return res.status(400).json({
      error: error.message
    });
  }

  if (error.statusCode === 404) {
    return res.status(404).json({
      error: error.message
    });
  }

  console.error(fallbackMessage, error.message);

  return res.status(500).json({
    error: fallbackMessage
  });
}