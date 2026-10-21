import * as bookingsRepository from "../repositories/bookings.repository.js";
import * as servicesRepository from "../repositories/services.repository.js";

export async function createBooking(bookingData) {
  if (
    !bookingData ||
    typeof bookingData !== "object" ||
    Array.isArray(bookingData)
  ) {
    throw createError(
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
      throw createError(
        `El campo ${field} es obligatorio y debe ser texto`,
        400
      );
    }
  }

  const clientEmail = bookingData.clientEmail.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    throw createError(
      "clientEmail debe tener un formato de correo válido",
      400
    );
  }

  const date = bookingData.date.trim();
  const time = bookingData.time.trim();

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw createError(
      "date debe ser una fecha válida con formato YYYY-MM-DD",
      400
    );
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw createError(
      "time debe tener formato HH:mm, entre 00:00 y 23:59",
      400
    );
  }

  const status = bookingData.status === undefined
    ? "pending"
    : bookingData.status;

  if (
    typeof status !== "string" ||
    status.trim() === ""
  ) {
    throw createError(
      "status debe ser un texto no vacío",
      400
    );
  }

  if (
    bookingData.services !== undefined &&
    (
      !Array.isArray(bookingData.services) ||
      bookingData.services.length !== 0
    )
  ) {
    throw createError(
      "La reserva debe crearse con services vacío; agregá los servicios mediante su endpoint",
      400
    );
  }

  const newBooking = {
    clientName: bookingData.clientName.trim(),
    clientEmail,
    date,
    time,
    status: status.trim(),
    services: []
  };

  return bookingsRepository.create(newBooking);
}

// El GET de la API devuelve los servicios completos.
export async function getBookingById(id) {
  return bookingsRepository.getByIdWithServices(id);
}

export async function addServiceToBooking(bookingId, serviceId) {
  // Para actualizar necesitamos las referencias, sin populate.
  const booking = await bookingsRepository.getById(bookingId);

  if (booking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  const service = await servicesRepository.getById(serviceId);

  if (service === null) {
    throw createError("Servicio no encontrado", 404);
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

  const updatedBooking = await bookingsRepository.update(
    bookingId,
    booking
  );

  if (updatedBooking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  return updatedBooking;
}

export async function removeServiceFromBooking(
  bookingId,
  serviceId
) {
  const booking = await bookingsRepository.getById(bookingId);

  if (booking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  const serviceIndex = booking.services.findIndex((item) => {
    return item.service === serviceId;
  });

  if (serviceIndex === -1) {
    throw createError(
      "El servicio no está asociado a esta reserva",
      404
    );
  }

  // Quita la asociación completa, independientemente de quantity.
  booking.services.splice(serviceIndex, 1);

  const updatedBooking = await bookingsRepository.update(
    bookingId,
    booking
  );

  if (updatedBooking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  return updatedBooking;
}

export async function updateServiceQuantity(
  bookingId,
  serviceId,
  quantity
) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw createError(
      "quantity debe ser un número entero positivo dentro del rango seguro",
      400
    );
  }

  const booking = await bookingsRepository.getById(bookingId);

  if (booking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  const existingService = booking.services.find((item) => {
    return item.service === serviceId;
  });

  if (!existingService) {
    throw createError(
      "El servicio no está asociado a esta reserva",
      404
    );
  }

  // Reemplaza la cantidad actual por la solicitada.
  existingService.quantity = quantity;

  const updatedBooking = await bookingsRepository.update(
    bookingId,
    booking
  );

  if (updatedBooking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  return updatedBooking;
}

export async function deleteBooking(bookingId) {
  const deletedBooking = await bookingsRepository.delete(
    bookingId
  );

  if (deletedBooking === null) {
    throw createError("Reserva no encontrada", 404);
  }

  return deletedBooking;
}

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
}

export async function getBookings() {
  return bookingsRepository.getAll();
}