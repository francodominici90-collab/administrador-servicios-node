import express from "express";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from "../controllers/services.controller.js";

const servicesRouter = express.Router();

/* Conectar cada endpoint con su controller */
servicesRouter.get("/", getServices);
servicesRouter.get("/:sid", getServiceById);
servicesRouter.post("/", createService);
servicesRouter.put("/:sid", updateService);
servicesRouter.delete("/:sid", deleteService);

export default servicesRouter;