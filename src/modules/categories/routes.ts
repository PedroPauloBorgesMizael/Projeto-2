import { Router } from "express";
import { CategoryController } from "./controllers/CategoryController";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";
import { ensureRole } from "@/shared/middlewares/ensureRole";

const routes = Router();
const controller = new CategoryController();

routes.post("/", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), controller.create);
routes.get("/", ensureAuthenticated, controller.list);

export default routes;