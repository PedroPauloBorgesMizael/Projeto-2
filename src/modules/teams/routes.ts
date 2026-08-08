import { Router } from "express";
import { TeamController } from "./controllers/TeamController";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";
import { ensureRole } from "@/shared/middlewares/ensureRole";

const routes = Router();
const controller = new TeamController();

routes.post("/", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), controller.create);
routes.get("/", ensureAuthenticated, controller.list);

export default routes;