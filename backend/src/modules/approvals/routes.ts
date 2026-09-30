import { Router } from "express";
import { ApprovalTypeController } from "./controllers/ApprovalTypeController";
import { ApprovalController } from "./controllers/ApprovalController";
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated";
import { ensureRole } from "@/shared/middlewares/ensureRole";

export const approvalTypeRoutes = Router();
const typeController = new ApprovalTypeController();

approvalTypeRoutes.get("/", ensureAuthenticated, typeController.list);
approvalTypeRoutes.post("/", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), typeController.create);
approvalTypeRoutes.post("/seed", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), typeController.seed);
approvalTypeRoutes.put("/:id", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), typeController.update);
approvalTypeRoutes.delete("/:id", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER"]), typeController.delete);

export const approvalRoutes = Router();
const approvalController = new ApprovalController();

approvalRoutes.post("/", ensureAuthenticated, ensureRole(["ADMIN", "MANAGER", "TECHNICIAN"]), approvalController.create);
approvalRoutes.patch("/:id/decide", ensureAuthenticated, approvalController.decide);
approvalRoutes.patch("/:id/cancel", ensureAuthenticated, approvalController.cancel);
approvalRoutes.get("/ticket/:ticketId", ensureAuthenticated, approvalController.listByTicket);
