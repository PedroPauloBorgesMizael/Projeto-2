import { Request, Response } from "express";
import { CreateTeamService, ListTeamService } from "../services/TeamService";

export class TeamController {
    /**
     * @swagger
     * /teams:
     *   post:
     *     summary: Criar team
     *     security:
     *       - bearerAuth: []
     *     tags: [teams]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       201:
     *         description: Sucesso
     */
    async create(request: Request, response: Response) {
        const service = new CreateTeamService();
        const result = await service.execute(request.body);
        return response.status(201).json(result);
    }
    
    /**
     * @swagger
     * /teams:
     *   get:
     *     summary: Listar teams
     *     security:
     *       - bearerAuth: []
     *     tags: [teams]
     *     responses:
     *       200:
     *         description: Sucesso
     */
    async list(request: Request, response: Response) {
        const service = new ListTeamService();
        const result = await service.execute();
        return response.json(result);
    }
}