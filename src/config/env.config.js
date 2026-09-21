import dotenv from "dotenv";

dotenv.config();

const requiredVariables = ["PORT", "NODE_ENV"];

for (const variable of requiredVariables) {
  const value = process.env[variable];

  if (!value || value.trim() === "") {
    throw new Error(
      `Falta la variable de entorno requerida: ${variable}`
    );
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(
    "La variable PORT debe ser un número entero positivo"
  );
}

const env = {
  port: port,
  nodeEnv: process.env.NODE_ENV
};

export default env;