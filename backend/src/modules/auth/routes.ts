// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "./controllers/AuthController";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";

const authRoutes = Router();
const authController = new AuthController();

// Rota pública
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh-token", authController.refreshToken);

// Rota protegida
authRoutes.get("/me", ensureAuthenticated, (req, res) => {
  return res.json(req.user);
});

export default authRoutes;