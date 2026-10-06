import mongoose from "mongoose";

const bookingServiceSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "quantity debe ser un número entero"
      }
    }
  },
  {
    _id: false
  }
);

const bookingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    default: "pending",
    trim: true
  },
  services: {
    type: [bookingServiceSchema],
    default: []
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;