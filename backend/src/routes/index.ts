import { Router } from "express";
import authRoutes from "@/modules/auth/routes";
import usersRoutes from "@/modules/users/routes";
import ticketsRoutes from "@/modules/tickets/routes";
import commentRoutes from "@/modules/comments/routes";
import teamRoutes from "@/modules/teams/routes";
import categoryRoutes from "@/modules/categories/routes";
import locationRoutes from "@/modules/locations/routes";
import metricsRoutes from "@/modules/metrics/routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", usersRoutes);
routes.use("/tickets", ticketsRoutes);
routes.use("/comments", commentRoutes);
routes.use("/teams", teamRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/locations", locationRoutes);
routes.use("/metrics", metricsRoutes);

export default routes;