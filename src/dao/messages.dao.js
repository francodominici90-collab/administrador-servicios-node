import Message from "../models/message.model.js";

export async function getAll() {
  const messages = await Message.find()
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  return messages.map(toMessage);
}

export async function create(messageData) {
  const message = await Message.create({
    author: messageData.author,
    text: messageData.text
  });

  return toMessage(message);
}

function toMessage(document) {
  return {
    id: document._id.toString(),
    author: document.author,
    text: document.text,
    createdAt: document.createdAt.toISOString()
  };
}