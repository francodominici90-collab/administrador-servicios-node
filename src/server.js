import app from "./app.js";
import env from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";

try {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Servidor disponible en http://localhost:${env.port}`);
    console.log(`Entorno: ${env.nodeEnv}`);
  });
} catch (error) {
  console.error("No se pudo conectar con MongoDB:", error.message);
  process.exit(1);
}