const chatView = document.querySelector("[data-messages-view]");

if (chatView) {
  const socket = io();

  const form = document.getElementById("message-form");
  const authorInput = document.getElementById("message-author");
  const textInput = document.getElementById("message-text");
  const submitButton = document.getElementById("message-submit");
  const status = document.getElementById("chat-status");
  const messagesList = document.getElementById("messages-list");

  const displayedIds = new Set(
    Array.from(
      messagesList.querySelectorAll("[data-message-id]"),
      (element) => element.dataset.messageId
    )
  );

  let sending = false;
  let historyReady = false;

  function updateButton() {
    submitButton.disabled =
      !socket.connected || !historyReady || sending;
  }

  function showMessage(message) {
    if (displayedIds.has(message.id)) return;

    document.getElementById("messages-empty")?.remove();

    const article = document.createElement("article");
    article.className = "service-card";
    article.dataset.messageId = message.id;

    const author = document.createElement("h3");
    author.textContent = message.author;

    const text = document.createElement("p");
    text.className = "message-text";
    text.textContent = message.text;

    const time = document.createElement("time");
    time.dateTime = message.createdAt;
    time.textContent = new Date(
      message.createdAt
    ).toLocaleString("es-AR");

    article.append(author, text, time);

    const nextMessage = Array.from(
      messagesList.querySelectorAll("[data-message-id]")
    ).find((element) => {
      const existingDate = element.querySelector("time").dateTime;

      return (
        existingDate > message.createdAt ||
        (
          existingDate === message.createdAt &&
          element.dataset.messageId > message.id
        )
      );
    });

    messagesList.insertBefore(article, nextMessage ?? null);
    displayedIds.add(message.id);
  }

  socket.on("connect", () => {
    historyReady = false;
    updateButton();
    status.textContent = "Conectado. Actualizando mensajes…";

    socket.timeout(10000).emit("messages:list", (error, response) => {
      if (!socket.connected) return;

      if (error || !response?.ok) {
        status.textContent =
          response?.error ??
          "No se pudo actualizar el historial. Recargá la página.";

        return;
      }

      response.messages.forEach(showMessage);

      historyReady = true;
      updateButton();
      status.textContent = "Conectado al chat";
    });
  });

  socket.on("disconnect", () => {
    historyReady = false;
    updateButton();
    status.textContent = "Sin conexión. Intentando reconectar…";
  });

  socket.on("connect_error", () => {
    historyReady = false;
    updateButton();
    status.textContent = "No se pudo conectar con el servidor.";
  });

  socket.on("messages:created", (message) => {
    showMessage(message);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!socket.connected || !historyReady || sending) return;
    if (!form.reportValidity()) return;

    const messageData = {
      author: authorInput.value.trim(),
      text: textInput.value.trim()
    };

    if (!messageData.author || !messageData.text) {
      status.textContent = "Completá tu nombre y el mensaje.";
      return;
    }

    sending = true;
    updateButton();
    status.textContent = "Enviando mensaje…";

    socket.timeout(10000).emit(
      "messages:create",
      messageData,
      (error, response) => {
        sending = false;
        updateButton();

        if (error) {
          status.textContent =
            "No llegó la confirmación. Revisá el historial antes de reenviar.";

          return;
        }

        if (!response?.ok) {
          status.textContent =
            response?.error ?? "No se pudo enviar el mensaje.";

          return;
        }

        showMessage(response.message);

        textInput.value = "";
        textInput.focus();
        status.textContent = "Mensaje guardado correctamente";
      }
    );
  });
}

const servicesView = document.querySelector("[data-services-view]");

if (servicesView) {
  const socket = io();

  const servicesList = document.getElementById("services-list");
  const servicesCount = document.getElementById("services-count");

  const onlyAvailable =
    servicesView.dataset.servicesView === "available";

  const endpoint = onlyAvailable
    ? "/api/services?available=true"
    : "/api/services";

  const status = document.createElement("p");
  status.setAttribute("role", "status");
  servicesList.before(status);

  let latestRequest = 0;

  function createServiceCard(service) {
    const article = document.createElement("article");
    article.className = "service-card";
    article.dataset.serviceId = service.id;

    const name = document.createElement("h2");
    name.textContent = service.name;

    const description = document.createElement("p");
    description.textContent = service.description;

    const details = document.createElement("dl");

    const fields = [
      ["Duración", `${service.duration} minutos`],
      ["Precio", `$ ${service.price}`],
      ["Categoría", service.category]
    ];

    for (const [label, value] of fields) {
      const term = document.createElement("dt");
      term.textContent = label;

      const definition = document.createElement("dd");
      definition.textContent = value;

      details.append(term, definition);
    }

    const badge = document.createElement("span");

    badge.className = service.available
      ? "badge badge-available"
      : "badge badge-unavailable";

    badge.textContent = service.available
      ? "Disponible"
      : "No disponible";

    article.append(name, description, details, badge);

    return article;
  }

  function renderServices(services) {
    const fragment = document.createDocumentFragment();

    if (services.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";

      emptyState.textContent = onlyAvailable
        ? "No hay servicios disponibles en este momento."
        : "Todavía no hay servicios registrados.";

      fragment.append(emptyState);
    } else {
      for (const service of services) {
        fragment.append(createServiceCard(service));
      }
    }

    servicesList.replaceChildren(fragment);
    servicesCount.textContent = services.length;
  }

  async function refreshServices() {
    const requestId = ++latestRequest;

    try {
      const services = [];
      let page = 1;
      let hasNextPage;

      do {
        const url = new URL(endpoint, window.location.origin);

        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", "100");

        const response = await fetch(url, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("No se pudieron consultar los servicios");
        }

        const result = await response.json();

        if (requestId !== latestRequest || !socket.connected) {
          return;
        }

        services.push(...result.services);

        hasNextPage = result.hasNextPage;
        page += 1;
      } while (hasNextPage);

      renderServices(services);
      status.textContent = "Listado actualizado en tiempo real";
    } catch (error) {
      if (requestId !== latestRequest || !socket.connected) {
        return;
      }

      console.error(
        "Error al actualizar la vista:",
        error.message
      );

      status.textContent =
        "No se pudo actualizar el listado. Se conserva la última información.";
    }
  }

  socket.on("connect", () => {
    console.log("Conexión de esta página:", socket.id);
    console.log("Página:", window.location.pathname);
    
    status.textContent = "Conectado. Actualizando servicios…";
    refreshServices();
  });

  socket.on("services:changed", () => {
    refreshServices();
  });

  socket.on("disconnect", (reason, details) => {
    console.log("Socket desconectado:", reason);
    console.log("Detalle:", details?.message);
    console.log("Contexto:", details?.context);
    console.log("Intentará reconectarse:", socket.active);

    status.textContent =
      "Sin conexión. El listado puede estar desactualizado.";
  });

  socket.on("connect_error", (error) => {
    console.error("Error de conexión:", error.message);
    console.log("Descripción:", error.description);
    console.log("Contexto:", error.context);

    status.textContent =
      "No se pudo conectar para recibir actualizaciones en tiempo real.";
  });
}