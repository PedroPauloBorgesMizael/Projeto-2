import { Router } from "express";

import { TicketController } from "./controllers/TicketController";

import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";

const routes = Router();

const controller = new TicketController();

routes.use(ensureAuthenticated);

routes.post("/", controller.create);

routes.get("/", controller.list);

routes.get("/export/pdf", controller.exportPdf);

routes.get("/:id", controller.findById);

routes.patch("/:id/status", controller.updateStatus);

import multer from "multer";
import { multerConfig } from "@/config/multer";

const upload = multer(multerConfig);

routes.patch("/:id/assign", controller.assignTechnician);

routes.get("/:id/history", controller.listHistory);

routes.post("/:id/attachments", upload.single("file"), controller.uploadAttachment);

routes.post("/sla-check", controller.checkSlaBreaches);

export default routes;