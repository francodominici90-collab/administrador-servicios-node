import * as bookingsDao from "../dao/bookings.dao.js";

export async function create(bookingData) {
  return bookingsDao.create(bookingData);
}

export async function getById(id) {
  return bookingsDao.getById(id);
}

export async function getByIdWithServices(id) {
  return bookingsDao.getByIdWithServices(id);
}

export async function update(id, updatedData) {
  return bookingsDao.update(id, updatedData);
}