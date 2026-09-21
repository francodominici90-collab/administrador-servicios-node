import env from "./config/env.config.js";
import ServiceManager from "./managers/ServiceManager.js";

const serviceManager = new ServiceManager();

async function main() {
  const services = await serviceManager.getServices();

  console.log(`Aplicación iniciada en modo ${env.nodeEnv}`);
  console.log(`Puerto configurado: ${env.port}`);
  console.log(`Servicios registrados: ${services.length}`);
  console.log(services);
}

main().catch((error) => {
  console.error(
    `No se pudo iniciar la aplicación: ${error.message}`
  );

  process.exitCode = 1;
});