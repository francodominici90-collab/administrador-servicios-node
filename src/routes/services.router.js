import express from "express";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from "../controllers/services.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createServiceSchema,
  updateServiceSchema,
  serviceParamsSchema,
  servicesQuerySchema
} from "../validators/services.schema.js";

const servicesRouter = express.Router();

servicesRouter.get(
  "/",
  validate(servicesQuerySchema, "query"),
  getServices
);

servicesRouter.get(
  "/:sid",
  validate(serviceParamsSchema, "params"),
  getServiceById
);

servicesRouter.post(
  "/",
  validate(createServiceSchema),
  createService
);

servicesRouter.put(
  "/:sid",
  validate(serviceParamsSchema, "params"),
  validate(updateServiceSchema),
  updateService
);

servicesRouter.delete(
  "/:sid",
  validate(serviceParamsSchema, "params"),
  deleteService
);

export default servicesRouter;