import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import env from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { configureMessagesSocket } from "./sockets/messages.socket.js";

const httpServer = createServer(app);
const io = new Server(httpServer);

// Permite que los controllers accedan a Socket.IO.
app.set("io", io);

configureMessagesSocket(io);

httpServer.on("error", (error) => {
  console.error("Error al iniciar el servidor HTTP:", error.message);
  process.exit(1);
});

try {
  await connectDB();

  httpServer.listen(env.port, () => {
    console.log(`Servidor disponible en http://localhost:${env.port}`);
    console.log(`Entorno: ${env.nodeEnv}`);
    console.log("Socket.IO configurado");
  });
} catch (error) {
  console.error("No se pudo iniciar la aplicación:", error.message);
  process.exit(1);
}