import * as messagesService from "../services/messages.service.js";

export function configureMessagesSocket(io) {
  io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("Cliente desconectado:", socket.id);
      console.log("Motivo:", reason);
    });
    socket.on("messages:list", async (callback) => {
      if (typeof callback !== "function") return;

      try {
        const messages = await messagesService.getMessages();

        callback({
          ok: true,
          messages
        });
      } catch (error) {
        console.error("No se pudieron cargar los mensajes:", error.message);

        callback({
          ok: false,
          error: "No se pudieron cargar los mensajes"
        });
      }
    });

    socket.on("messages:create", async (messageData, callback) => {
      if (typeof callback !== "function") return;

      try {
        const message = await messagesService.createMessage(messageData);

        // Se comparte únicamente después de guardarlo en MongoDB.
        io.emit("messages:created", message);

        callback({
          ok: true,
          message
        });
      } catch (error) {
        const isValidationError =
          error.statusCode === 400 ||
          error.name === "ValidationError";

        if (!isValidationError) {
          console.error("No se pudo guardar el mensaje:", error.message);
        }

        callback({
          ok: false,
          error: isValidationError
            ? error.message
            : "No se pudo guardar el mensaje"
        });
      }
    });
  });
}