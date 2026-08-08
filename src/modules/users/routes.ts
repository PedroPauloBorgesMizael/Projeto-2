import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";

const routes = Router();

const controller = new UserController();

routes.use(ensureAuthenticated);

routes.post("/", controller.create);

routes.get("/", controller.list);

routes.patch("/:id/status", controller.changeStatus);

routes.delete("/:id", controller.delete);

export default routes;