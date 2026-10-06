import mongoose from "mongoose";
import Service from "../models/service.model.js";

export async function getAll() {
  const services = await Service.find().lean();

  return services.map(toService);
}

export async function getById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const service = await Service.findById(id).lean();

  return toService(service);
}

export async function create(serviceData) {
  const service = await Service.create(toPersistenceData(serviceData));

  return toService(service);
}

export async function update(id, updatedData) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const service = await Service.findByIdAndUpdate(
    id,
    { $set: toPersistenceData(updatedData) },
    {
      returnDocument: "after",
      runValidators: true
    }
  ).lean();

  return toService(service);
}

async function deleteById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const service = await Service.findByIdAndDelete(id).lean();

  return toService(service);
}

export { deleteById as delete };

function toPersistenceData(data) {
  const fields = [
    "name",
    "description",
    "duration",
    "price",
    "category",
    "available"
  ];

  const result = {};

  for (const field of fields) {
    if (Object.hasOwn(data, field)) {
      result[field] = data[field];
    }
  }

  return result;
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