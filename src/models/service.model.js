import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => Number.isFinite(value) && value > 0,
      message: "duration debe ser un número mayor que 0"
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (value) => Number.isFinite(value),
      message: "price debe ser un número finito"
    }
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  available: {
    type: Boolean,
    required: true
  }
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;