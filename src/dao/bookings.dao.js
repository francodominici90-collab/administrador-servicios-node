import { readFile, writeFile } from "node:fs/promises";

const bookingsFile = new URL(
  "../data/bookings.json",
  import.meta.url
);

/* Guardar una reserva con ID generado */
export async function create(bookingData) {
  const bookings = await readAll();

  const lastId = bookings.reduce((highestId, booking) => {
    return Math.max(highestId, booking.id);
  }, 0);

  const newBooking = {
    ...bookingData,
    id: lastId + 1
  };

  bookings.push(newBooking);

  await saveAll(bookings);

  return newBooking;
}

/* Buscar una reserva por ID */
export async function getById(id) {
  const bookings = await readAll();

  return bookings.find((booking) => {
    return booking.id === Number(id);
  }) ?? null;
}

/* Actualizar un registro existente */
export async function update(id, updatedData) {
  const bookings = await readAll();

  const bookingIndex = bookings.findIndex((booking) => {
    return booking.id === Number(id);
  });

  if (bookingIndex === -1) {
    return null;
  }

  const updatedBooking = {
    ...bookings[bookingIndex],
    ...updatedData,
    id: bookings[bookingIndex].id
  };

  bookings[bookingIndex] = updatedBooking;

  await saveAll(bookings);

  return updatedBooking;
}

/* Leer las reservas del archivo */
async function readAll() {
  const content = await readFile(bookingsFile, "utf-8");
  const bookings = JSON.parse(content);

  if (!Array.isArray(bookings)) {
    throw new Error(
      "El archivo bookings.json debe contener un array"
    );
  }

  return bookings;
}

/* Escribir el array completo en el archivo */
async function saveAll(bookings) {
  const content = JSON.stringify(bookings, null, 2);

  await writeFile(
    bookingsFile,
    `${content}\n`,
    "utf-8"
  );
}