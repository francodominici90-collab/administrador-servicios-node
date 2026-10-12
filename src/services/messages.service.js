import * as messagesRepository from "../repositories/messages.repository.js";

export async function getMessages() {
  return messagesRepository.getAll();
}

export async function createMessage(messageData) {
  if (
    !messageData ||
    typeof messageData !== "object" ||
    Array.isArray(messageData)
  ) {
    throw validationError("Los datos del mensaje deben ser un objeto");
  }

  if (
    typeof messageData.author !== "string" ||
    messageData.author.trim() === ""
  ) {
    throw validationError("author es obligatorio y debe ser texto");
  }

  if (
    typeof messageData.text !== "string" ||
    messageData.text.trim() === ""
  ) {
    throw validationError("text es obligatorio y debe ser texto");
  }

  const author = messageData.author.trim();
  const text = messageData.text.trim();

  if (author.length > 100) {
    throw validationError("author no puede superar los 100 caracteres");
  }

  if (text.length > 1000) {
    throw validationError("text no puede superar los 1000 caracteres");
  }

  return messagesRepository.create({
    author,
    text
  });
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;

  return error;
}