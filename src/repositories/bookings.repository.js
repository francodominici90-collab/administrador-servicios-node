import * as bookingsDao from "../dao/bookings.dao.js";

/* Crear una reserva */
export async function create(bookingData) {
  return bookingsDao.create(bookingData);
}

/* Obtener una reserva por ID */
export async function getById(id) {
  return bookingsDao.getById(id);
}

/* Actualizar una reserva */
export async function update(id, updatedData) {
  return bookingsDao.update(id, updatedData);
}