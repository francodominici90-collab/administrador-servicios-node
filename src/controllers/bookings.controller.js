import * as bookingsService from "../services/bookings.service.js";

/* Crear una reserva */
export async function createBooking(req, res) {
  try {
    const booking = await bookingsService.createBooking(req.body);

    return res.status(201).json(booking);
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo crear la reserva"
    );
  }
}

/* Obtener una reserva por ID */
export async function getBookingById(req, res) {
  try {
    const { bid } = req.params;

    const booking = await bookingsService.getBookingById(bid);

    if (booking === null) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo obtener la reserva"
    );
  }
}

/* Agregar un servicio a una reserva */
export async function addServiceToBooking(req, res) {
  try {
    const { bid, sid } = req.params;

    const booking = await bookingsService.addServiceToBooking(
      bid,
      sid
    );

    return res.status(200).json(booking);
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo agregar el servicio a la reserva"
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