import { z } from "zod";

export function requiredText(field) {
  return z
    .string({
      error: `${field} es obligatorio y debe ser texto`
    })
    .trim()
    .min(1, {
      error: `${field} no puede estar vacío`
    });
}

export const objectIdSchema = z
  .string({
    error: "El identificador debe ser texto"
  })
  .regex(/^[a-fA-F0-9]{24}$/, {
    error: "El identificador debe tener 24 caracteres hexadecimales"
  })
  .transform((value) => value.toLowerCase());