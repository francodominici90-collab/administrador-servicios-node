import dotenv from "dotenv";

dotenv.config();

const requiredVariables = ["PORT", "NODE_ENV", "MONGO_URI"];

for (const variable of requiredVariables) {
  if (!process.env[variable]?.trim()) {
    throw new Error(`Falta la variable de entorno requerida: ${variable}`);
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT debe ser un número entero entre 1 y 65535");
}

const env = {
  port,
  nodeEnv: process.env.NODE_ENV.trim(),
  mongoUri: process.env.MONGO_URI.trim()
};

export default env;