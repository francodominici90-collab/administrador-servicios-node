import express from "express";
import { renderServices } from "../controllers/views.controller.js";

const pagesRouter = express.Router();

pagesRouter.get("/services", renderServices);
pagesRouter.get("/realtime-services", renderServices);

export default pagesRouter;