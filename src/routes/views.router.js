import express from "express";

import {
  renderServices,
  renderAvailability,
  renderBookings,
  renderBooking,
  renderMessages
} from "../controllers/views.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { bookingParamsSchema } from "../validators/bookings.schema.js";

const viewsRouter = express.Router();

viewsRouter.get("/services", renderServices);

viewsRouter.get("/availability", renderAvailability);

viewsRouter.get("/bookings", renderBookings);

viewsRouter.get(
  "/bookings/:bid",
  validate(bookingParamsSchema, "params"),
  renderBooking
);

viewsRouter.get("/messages", renderMessages);

export default viewsRouter;