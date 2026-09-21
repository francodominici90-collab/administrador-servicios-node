import app from "./app.js";
import env from "./config/env.config.js";

app.listen(env.port, () => {
  console.log(
    `Servidor funcionando en http://localhost:${env.port}`
  );
  console.log(`Entorno: ${env.nodeEnv}`);
});