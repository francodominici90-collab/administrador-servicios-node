import * as servicesService from "../services/services.service.js";
import * as messagesService from "../services/messages.service.js";

export async function renderServices(req, res) {
  try {
    const services = await servicesService.getServices();

    return res.render("services", {
      title: "Servicios",
      services
    });
  } catch (error) {
    console.error(
      "No se pudo cargar la vista de servicios:",
      error.message
    );

    return res.status(500).send(
      "No se pudo cargar la página de servicios"
    );
  }
}

export async function renderAvailability(req, res) {
  try {
    const services = await servicesService.getServices({
      available: "true"
    });

    return res.render("availability", {
      title: "Servicios disponibles",
      services
    });
  } catch (error) {
    console.error(
      "No se pudo cargar la vista de disponibilidad:",
      error.message
    );

    return res.status(500).send(
      "No se pudo cargar la página de disponibilidad"
    );
  }
}

export async function renderMessages(req, res) {
  try {
    const messages = await messagesService.getMessages();

    return res.render("messages", {
      title: "Chat",
      messages
    });
  } catch (error) {
    console.error(
      "No se pudo cargar la vista de mensajes:",
      error.message
    );

    return res.status(500).send(
      "No se pudo cargar la página de mensajes"
    );
  }
}