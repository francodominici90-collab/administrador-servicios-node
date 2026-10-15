import mongoose from "mongoose";

import Booking from "../models/booking.model.js";
import Service from "../models/service.model.js";

export async function create(bookingData) {
  const booking = await Booking.create(
    toPersistenceData(bookingData)
  );

  return toBooking(booking);
}

// Consulta con referencias: utilizada para modificar la reserva.
export async function getById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const booking = await Booking.findById(id).lean();

  return toBooking(booking);
}

// Consulta con los datos completos de los servicios.
export async function getByIdWithServices(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const booking = await Booking.findById(id)
    .populate({
      path: "services.service",
      model: Service
    })
    .lean();

  return toBooking(booking, true);
}

export async function update(id, updatedData) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    {
      $set: toPersistenceData(updatedData)
    },
    {
      returnDocument: "after",
      runValidators: true
    }
  ).lean();

  return toBooking(booking);
}

function toPersistenceData(data) {
  const fields = [
    "clientName",
    "clientEmail",
    "date",
    "time",
    "status"
  ];

  const result = {};

  for (const field of fields) {
    if (Object.hasOwn(data, field)) {
      result[field] = data[field];
    }
  }

  if (Object.hasOwn(data, "services")) {
    result.services = data.services.map((item) => ({
      service: item.service,
      quantity: item.quantity
    }));
  }

  return result;
}

function toBooking(document, populated = false) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    clientName: document.clientName,
    clientEmail: document.clientEmail,
    date: document.date,
    time: document.time,
    status: document.status,
    services: document.services.map((item) => ({
      service: populated
        ? toService(item.service)
        : item.service.toString(),
      quantity: item.quantity
    }))
  };
}

function toService(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    name: document.name,
    description: document.description,
    duration: document.duration,
    price: document.price,
    category: document.category,
    available: document.available
  };
}