import express from "express";

import {
  renderServices,
  renderAvailability,
  renderMessages
} from "../controllers/views.controller.js";

const viewsRouter = express.Router();

viewsRouter.get("/services", renderServices);
viewsRouter.get("/availability", renderAvailability);
viewsRouter.get("/messages", renderMessages);

export default viewsRouter;