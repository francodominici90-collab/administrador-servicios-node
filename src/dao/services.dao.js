import mongoose from "mongoose";
import Service from "../models/service.model.js";

export async function getAll() {
  const services = await Service.find().lean();

  return services.map(toService);
}

export async function getPaginated({
  category,
  available,
  page,
  limit,
  sortBy,
  order
}) {
  const filter = {};

  if (category !== undefined) {
    filter.category = {
      $regex: `^${escapeRegExp(category)}$`,
      $options: "i"
    };
  }

  if (available !== undefined) {
    filter.available = available;
  }

  const sortField = sortBy === "id" ? "_id" : sortBy;
  const sortDirection = order === "desc" ? -1 : 1;

  const sort = {
    [sortField]: sortDirection
  };

  // Desempata resultados para mantener un orden consistente.
  if (sortField !== "_id") {
    sort._id = sortDirection;
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Service.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Service.countDocuments(filter)
  ]);

  return {
    services: documents.map(toService),
    total
  };
}

export async function getById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const service = await Service.findById(id).lean();

  return toService(service);
}

export async function create(serviceData) {
  const service = await Service.create(
    toPersistenceData(serviceData)
  );

  return toService(service);
}

export async function update(id, updatedData) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  const service = await Service.findByIdAndUpdate(
    id,
    {
      $set: toPersistenceData(updatedData)
    },
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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