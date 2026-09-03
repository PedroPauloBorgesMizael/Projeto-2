import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";
import { RefreshTokenService } from "../services/RefreshTokenService";

export class AuthController {

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Realiza login no sistema
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *       401:
   *         description: Credenciais inválidas
   */
  async login(request: Request, response: Response) {
    const { email, password } = request.body;

    const service = new AuthenticateUserService();

    const result = await service.execute({
      email,
      password,
    });

    return response.json(result);
  }

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Renova o token de acesso
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token renovado
   *       401:
   *         description: Refresh token inválido
   */
  async refreshToken(request: Request, response: Response) {
    const { refreshToken } = request.body;

    const service = new RefreshTokenService();

    try {
      const result = await service.execute(refreshToken);
      return response.json(result);
    } catch (error: any) {
      return response.status(401).json({ message: error.message });
    }
  }
}