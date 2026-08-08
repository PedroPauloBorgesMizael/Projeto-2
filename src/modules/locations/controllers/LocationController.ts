import { Request, Response } from "express";
import { CreateLocationService, ListLocationService } from "../services/LocationService";

export class LocationController {
    /**
     * @swagger
     * /locations:
     *   post:
     *     summary: Criar location
     *     security:
     *       - bearerAuth: []
     *     tags: [locations]
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
        const service = new CreateLocationService();
        const result = await service.execute(request.body);
        return response.status(201).json(result);
    }
    
    /**
     * @swagger
     * /locations:
     *   get:
     *     summary: Listar locations
     *     security:
     *       - bearerAuth: []
     *     tags: [locations]
     *     responses:
     *       200:
     *         description: Sucesso
     */
    async list(request: Request, response: Response) {
        const service = new ListLocationService();
        const result = await service.execute();
        return response.json(result);
    }
}