import { readFile, writeFile } from "node:fs/promises";
import ServiceManager from "./ServiceManager.js";

const bookingsFile = new URL(
  "../data/bookings.json",
  import.meta.url
);

class BookingManager {
  constructor(filePath = bookingsFile) {
    this.filePath = filePath;
    this.serviceManager = new ServiceManager();
  }

  /* Crear una reserva */
  async createBooking(bookingData) {
    if (
      !bookingData ||
      typeof bookingData !== "object" ||
      Array.isArray(bookingData)
    ) {
      throw this.#createError(
        "Los datos de la reserva deben ser un objeto",
        400
      );
    }

    const requiredFields = [
      "clientName",
      "clientEmail",
      "date",
      "time"
    ];

    for (const field of requiredFields) {
      if (
        typeof bookingData[field] !== "string" ||
        bookingData[field].trim() === ""
      ) {
        throw this.#createError(
          `El campo ${field} es obligatorio y debe ser texto`,
          400
        );
      }
    }

    const clientEmail = bookingData.clientEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      throw this.#createError(
        "clientEmail debe tener un formato de correo válido",
        400
      );
    }

    const date = bookingData.date.trim();
    const time = bookingData.time.trim();

    /* Validar el formato y que la fecha exista */
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw this.#createError(
        "date debe ser una fecha válida con formato YYYY-MM-DD",
        400
      );
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      throw this.#createError(
        "time debe tener formato HH:mm, entre 00:00 y 23:59",
        400
      );
    }

    const status =
      bookingData.status === undefined
        ? "pending"
        : bookingData.status;

    if (
      typeof status !== "string" ||
      status.trim() === ""
    ) {
      throw this.#createError(
        "status debe ser un texto no vacío",
        400
      );
    }

    /* Los servicios se agregan después de crear la reserva */
    if (
      bookingData.services !== undefined &&
      (
        !Array.isArray(bookingData.services) ||
        bookingData.services.length !== 0
      )
    ) {
      throw this.#createError(
        "La reserva debe crearse con services vacío; agregá los servicios mediante su endpoint",
        400
      );
    }

    const bookings = await this.#readBookings();

    const lastId = bookings.reduce((highestId, booking) => {
      return Math.max(highestId, booking.id);
    }, 0);

    const newBooking = {
      id: lastId + 1,
      clientName: bookingData.clientName.trim(),
      clientEmail,
      date,
      time,
      status: status.trim(),
      services: []
    };

    bookings.push(newBooking);

    await this.#saveBookings(bookings);

    return newBooking;
  }

  /* Buscar una reserva por ID */
  async getBookingById(id) {
    const bookings = await this.#readBookings();

    return bookings.find((booking) => {
      return booking.id === Number(id);
    }) ?? null;
  }

  /* Agregar un servicio o incrementar su cantidad */
  async addServiceToBooking(bookingId, serviceId) {
    const bookings = await this.#readBookings();

    const booking = bookings.find((currentBooking) => {
      return currentBooking.id === Number(bookingId);
    });

    if (!booking) {
      throw this.#createError(
        "Reserva no encontrada",
        404
      );
    }

    const service =
      await this.serviceManager.getServiceById(serviceId);

    if (!service) {
      throw this.#createError(
        "Servicio no encontrado",
        404
      );
    }

    const existingService = booking.services.find((item) => {
      return item.service === service.id;
    });

    if (existingService) {
      existingService.quantity += 1;
    } else {
      booking.services.push({
        service: service.id,
        quantity: 1
      });
    }

    await this.#saveBookings(bookings);

    return booking;
  }

  /* Leer las reservas del archivo JSON */
  async #readBookings() {
    const content = await readFile(this.filePath, "utf-8");
    const bookings = JSON.parse(content);

    if (!Array.isArray(bookings)) {
      throw new Error(
        "El archivo bookings.json debe contener un array"
      );
    }

    return bookings;
  }

  /* Guardar las reservas */
  async #saveBookings(bookings) {
    const content = JSON.stringify(bookings, null, 2);

    await writeFile(
      this.filePath,
      `${content}\n`,
      "utf-8"
    );
  }

  /* Crear errores que el router podrá identificar */
  #createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;

    return error;
  }
}

export default BookingManager;