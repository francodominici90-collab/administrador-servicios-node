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
    return handleError(
      error,
      res,
      "No se pudieron obtener los servicios"
    );
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
    return handleError(
      error,
      res,
      "No se pudo obtener el servicio"
    );
  }
}

/* Crear un servicio */
export async function createService(req, res) {
  try {
    const service = await servicesService.createService(req.body);

    return res.status(201).json(service);
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo crear el servicio"
    );
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
    return handleError(
      error,
      res,
      "No se pudo actualizar el servicio"
    );
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
    return handleError(
      error,
      res,
      "No se pudo eliminar el servicio"
    );
  }
}

/* Construir la respuesta de error */
function handleError(error, res, fallbackMessage) {
  const statusCode = error.statusCode ?? 500;

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: statusCode === 500
      ? fallbackMessage
      : error.message
  });
}