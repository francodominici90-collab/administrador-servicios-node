import * as messagesDao from "../dao/messages.dao.js";

export async function getAll() {
  return messagesDao.getAll();
}

export async function create(messageData) {
  return messagesDao.create(messageData);
}