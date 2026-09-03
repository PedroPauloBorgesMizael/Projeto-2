import { Router } from "express";
import { MetricsController } from "./controllers/MetricsController";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";

const routes = Router();
const controller = new MetricsController();

routes.use(ensureAuthenticated);

routes.get("/dashboard", controller.dashboard);

export default routes;
