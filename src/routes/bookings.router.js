import express from "express";

import {
  createBooking,
  getBookingById,
  addServiceToBooking,
  removeServiceFromBooking,
  updateServiceQuantity,
  deleteBooking
} from "../controllers/bookings.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createBookingSchema,
  bookingParamsSchema,
  bookingServiceParamsSchema,
  updateServiceQuantitySchema
} from "../validators/bookings.schema.js";

const bookingsRouter = express.Router();

bookingsRouter.post(
  "/",
  validate(createBookingSchema),
  createBooking
);

bookingsRouter.get(
  "/:bid",
  validate(bookingParamsSchema, "params"),
  getBookingById
);

bookingsRouter.post(
  "/:bid/services/:sid",
  validate(bookingServiceParamsSchema, "params"),
  addServiceToBooking
);

bookingsRouter.put(
  "/:bid/services/:sid",
  validate(bookingServiceParamsSchema, "params"),
  validate(updateServiceQuantitySchema),
  updateServiceQuantity
);

bookingsRouter.delete(
  "/:bid/services/:sid",
  validate(bookingServiceParamsSchema, "params"),
  removeServiceFromBooking
);

bookingsRouter.delete(
  "/:bid",
  validate(bookingParamsSchema, "params"),
  deleteBooking
);

export default bookingsRouter;