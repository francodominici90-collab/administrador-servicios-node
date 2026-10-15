import * as servicesDao from "../dao/services.dao.js";

export async function getAll() {
  return servicesDao.getAll();
}

export async function getPaginated(options) {
  return servicesDao.getPaginated(options);
}

export async function getById(id) {
  return servicesDao.getById(id);
}

export async function create(serviceData) {
  return servicesDao.create(serviceData);
}

export async function update(id, updatedData) {
  return servicesDao.update(id, updatedData);
}

async function deleteById(id) {
  return servicesDao.delete(id);
}

export { deleteById as delete };