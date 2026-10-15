import { z } from "zod";

import {
  requiredText,
  objectIdSchema
} from "./common.schema.js";

export const createServiceSchema = z.object({
  name: requiredText("name"),

  description: requiredText("description"),

  duration: z
    .number({
      error: "duration es obligatorio y debe ser un número"
    })
    .positive({
      error: "duration debe ser mayor que cero"
    }),

  price: z
    .number({
      error: "price es obligatorio y debe ser un número"
    })
    .nonnegative({
      error: "price debe ser mayor o igual que cero"
    }),

  category: requiredText("category"),

  available: z.boolean({
    error: "available es obligatorio y debe ser true o false"
  })
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceParamsSchema = z.object({
  sid: objectIdSchema
});

function positiveIntegerQuery(field, maximum) {
  return z
    .string({
      error: `${field} debe enviarse una sola vez como texto`
    })
    .regex(/^[0-9]+$/, {
      error: `${field} debe ser un número entero positivo`
    })
    .pipe(
      z.coerce
        .number()
        .int({
          error: `${field} debe ser un entero válido`
        })
        .min(1, {
          error: `${field} debe ser mayor o igual que 1`
        })
        .max(maximum, {
          error: `${field} no puede superar ${maximum}`
        })
    );
}

export const servicesQuerySchema = z.object({
  category: z
    .string({
      error: "category debe ser texto"
    })
    .optional(),

  available: z
    .string({
      error: "available debe ser true o false"
    })
    .toLowerCase()
    .pipe(
      z.enum(["true", "false"], {
        error: "available debe ser true o false"
      })
    )
    .transform((value) => value === "true")
    .optional(),

  page: positiveIntegerQuery(
    "page",
    Math.floor(Number.MAX_SAFE_INTEGER / 100)
  ).default(1),

  limit: positiveIntegerQuery("limit", 100).default(10),

  sortBy: z
    .enum(
      ["id", "name", "description", "duration", "price", "category", "available"],
      {
        error:
          "sortBy debe ser id, name, description, duration, price, category o available"
      }
    )
    .default("id"),

  order: z
    .string({
      error: "order debe ser asc o desc"
    })
    .toLowerCase()
    .pipe(
      z.enum(["asc", "desc"], {
        error: "order debe ser asc o desc"
      })
    )
    .default("asc")
});