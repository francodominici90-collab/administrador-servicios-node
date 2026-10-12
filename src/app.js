import express from "express";
import { engine } from "express-handlebars";
import { fileURLToPath } from "node:url";

import servicesRouter from "./routes/services.router.js";
import bookingsRouter from "./routes/bookings.router.js";
import viewsRouter from "./routes/views.router.js";

const app = express();

const viewsPath = fileURLToPath(new URL("./views/", import.meta.url));
const publicPath = fileURLToPath(new URL("./public/", import.meta.url));

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main"
  })
);

app.set("view engine", "handlebars");
app.set("views", viewsPath);

app.use(express.json());
app.use(express.static(publicPath));

app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/views", viewsRouter);

export default app;