import express from "express";
import BookingManager from "../managers/BookingManager.js";

const bookingsRouter = express.Router();
const bookingManager = new BookingManager();

/* Crear una reserva */
bookingsRouter.post("/", async (req, res) => {
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
});

/* Obtener una reserva por ID */
bookingsRouter.get("/:bid", async (req, res) => {
  try {
    const booking = await bookingManager.getBookingById(
      req.params.bid
    );

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
});

/* Agregar un servicio a una reserva */
bookingsRouter.post("/:bid/services/:sid", async (req, res) => {
  try {
    const { bid, sid } = req.params;

    const booking = await bookingManager.addServiceToBooking(
      bid,
      sid
    );

    return res.status(200).json(booking);
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
});

export default bookingsRouter;