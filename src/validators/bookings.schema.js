import { z } from "zod";

import {
  requiredText,
  objectIdSchema
} from "./common.schema.js";

export const createBookingSchema = z.object({
  clientName: requiredText("clientName"),

  clientEmail: requiredText("clientEmail").regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    {
      error: "clientEmail debe tener un formato de correo válido"
    }
  ),

  date: requiredText("date").pipe(
    z.iso.date({
      error: "date debe ser una fecha válida con formato YYYY-MM-DD"
    })
  ),

  time: requiredText("time").pipe(
    z.iso.time({
      precision: -1,
      error: "time debe ser una hora válida con formato HH:mm"
    })
  ),

  status: requiredText("status").default("pending"),

  services: z
    .array(z.unknown(), {
      error: "services debe ser un array"
    })
    .length(0, {
      error: "La reserva debe crearse sin servicios asociados"
    })
    .default([])
});

export const bookingParamsSchema = z.object({
  bid: objectIdSchema
});

// Se reutiliza para agregar, quitar y cambiar la cantidad.
export const bookingServiceParamsSchema = z.object({
  bid: objectIdSchema,
  sid: objectIdSchema
});

export const updateServiceQuantitySchema = z.object({
  quantity: z
    .number({
      error: "quantity es obligatorio y debe ser un número"
    })
    .int({
      error: "quantity debe ser un número entero dentro del rango seguro"
    })
    .min(1, {
      error: "quantity debe ser mayor o igual que 1"
    })
});