import * as servicesDao from "../dao/services.dao.js";

/* Obtener todos los servicios */
export async function getAll() {
  return servicesDao.getAll();
}

/* Obtener un servicio por ID */
export async function getById(id) {
  return servicesDao.getById(id);
}

/* Crear un servicio */
export async function create(serviceData) {
  return servicesDao.create(serviceData);
}

/* Actualizar un servicio */
export async function update(id, updatedData) {
  return servicesDao.update(id, updatedData);
}

/* Eliminar un servicio */
async function deleteById(id) {
  return servicesDao.delete(id);
}

export { deleteById as delete };