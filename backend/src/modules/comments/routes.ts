import { Router } from "express";

import { CommentController } from "./controllers/CommentController";
import { ensureAuthenticated } from "../auth/middlewares/ensureAuthenticated";

const commentRoutes = Router();

const commentController = new CommentController();

commentRoutes.use(ensureAuthenticated);

commentRoutes.post("/", commentController.create);

commentRoutes.get("/:ticketId", commentController.list);

export default commentRoutes;