import { Request, Response } from "express";
import { CreateCategoryService, ListCategoryService } from "../services/CategoryService";

export class CategoryController {
    /**
     * @swagger
     * /categories:
     *   post:
     *     summary: Criar category
     *     security:
     *       - bearerAuth: []
     *     tags: [categories]
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
        const service = new CreateCategoryService();
        const result = await service.execute(request.body);
        return response.status(201).json(result);
    }
    
    /**
     * @swagger
     * /categories:
     *   get:
     *     summary: Listar categories
     *     security:
     *       - bearerAuth: []
     *     tags: [categories]
     *     responses:
     *       200:
     *         description: Sucesso
     */
    async list(request: Request, response: Response) {
        const service = new ListCategoryService();
        const result = await service.execute();
        return response.json(result);
    }
}