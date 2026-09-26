import express from "express";

import {
  createBooking,
  getBookingById,
  addServiceToBooking
} from "../controllers/bookings.controller.js";

const bookingsRouter = express.Router();

/* Conectar cada endpoint con su controller */
bookingsRouter.post("/", createBooking);
bookingsRouter.get("/:bid", getBookingById);
bookingsRouter.post("/:bid/services/:sid", addServiceToBooking);

export default bookingsRouter;