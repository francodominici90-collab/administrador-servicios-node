import express from "express";

import {
  createBooking,
  getBookingById,
  addServiceToBooking
} from "../controllers/bookings.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createBookingSchema,
  bookingParamsSchema,
  addServiceToBookingParamsSchema
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
  validate(addServiceToBookingParamsSchema, "params"),
  addServiceToBooking
);

export default bookingsRouter;