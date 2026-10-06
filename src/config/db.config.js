import mongoose from "mongoose";
import env from "./env.config.js";

export async function connectDB() {
  await mongoose.connect(env.mongoUri);

  console.log("Conexión con MongoDB establecida correctamente");
}