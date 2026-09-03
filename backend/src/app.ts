import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger";

import userRoutes from "@/modules/users/routes";
import authRoutes from "@/modules/auth/routes";
import ticketRoutes from "@/modules/tickets/routes";
import commentRoutes from "./modules/comments/routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/comments", commentRoutes);

app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return response.status(400).json({
      error: err.message,
    });
  }

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export { app };