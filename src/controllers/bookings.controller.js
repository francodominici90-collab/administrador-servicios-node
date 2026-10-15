import * as bookingsService from "../services/bookings.service.js";

export async function createBooking(req, res) {
  try {
    const booking = await bookingsService.createBooking(
      req.validated.body
    );

    return res.status(201).json(booking);
  } catch (error) {
    return handleError(error, res, "No se pudo crear la reserva");
  }
}

export async function getBookingById(req, res) {
  try {
    const { bid } = req.validated.params;
    const booking = await bookingsService.getBookingById(bid);

    if (booking === null) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return handleError(error, res, "No se pudo obtener la reserva");
  }
}

export async function addServiceToBooking(req, res) {
  try {
    const { bid, sid } = req.validated.params;

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