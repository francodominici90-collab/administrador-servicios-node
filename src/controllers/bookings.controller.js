import BookingManager from "../managers/BookingManager.js";
import ServiceManager from "../managers/ServiceManager.js";

const bookingManager = new BookingManager();
const serviceManager = new ServiceManager();

/* Crear una reserva */
export async function createBooking(req, res) {
  try {
    const booking = await bookingManager.createBooking(req.body);

    return res.status(201).json(booking);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;

    if (statusCode === 500) {
      console.error(error);
    }

    return res.status(statusCode).json({
      error: statusCode === 500
        ? "No se pudo crear la reserva"
        : error.message
    });
  }
}

/* Obtener una reserva por ID */
export async function getBookingById(req, res) {
  try {
    const { bid } = req.params;

    const booking = await bookingManager.getBookingById(bid);

    if (booking === null) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "No se pudo obtener la reserva"
    });
  }
}

/* Agregar un servicio a una reserva */
export async function addServiceToBooking(req, res) {
  try {
    const { bid, sid } = req.params;

    const booking = await bookingManager.getBookingById(bid);

    if (booking === null) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    const service = await serviceManager.getServiceById(sid);

    if (service === null) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    const updatedBooking = await bookingManager.addServiceToBooking(
      bid,
      sid
    );

    return res.status(200).json(updatedBooking);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;

    if (statusCode === 500) {
      console.error(error);
    }

    return res.status(statusCode).json({
      error: statusCode === 500
        ? "No se pudo agregar el servicio a la reserva"
        : error.message
    });
  }
}