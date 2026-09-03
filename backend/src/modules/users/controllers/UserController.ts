import { Request, Response } from "express";
import { CreateUserService } from "../services/CreateUserService";
import { ListUsersService } from "../services/ListUsersService";
import { DeleteUserService } from "../services/DeleteUserService";
import { ChangeUserStatusService } from "../services/ChangeUserStatusService";
import { getPaginationParams } from "@/shared/utils/pagination";

export class UserController {

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Criar usuário
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *                 example: REQUESTER
     *     responses:
     *       201:
     *         description: Usuário criado com sucesso
     */

    async create(request: Request, response: Response) {
        const { name, email, password, role } = request.body;

        const service = new CreateUserService();

        const result = await service.execute({
            name,
            email,
            password,
            role,
        });

        return response.status(201).json(result);
    }

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Listar usuários
     *     security:
     *       - bearerAuth: []
     *     tags: [Users]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: role
     *         schema:
     *           type: string
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Lista de usuários com paginação
     */
    async list(request: Request, response: Response) {
        const pagination = getPaginationParams(request.query);
        const { name, role, status } = request.query;

        const service = new ListUsersService();

        const result = await service.execute({
            pagination,
            filters: {
                name: name as string,
                role: role as string,
                status: status as string
            }
        });

        return response.json(result);
    }

    /**
     * @swagger
     * /users/{id}/status:
     *   patch:
     *     summary: Alterar status do usuário (ACTIVE/INACTIVE)
     *     security:
     *       - bearerAuth: []
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               status:
     *                 type: string
     *                 example: INACTIVE
     *     responses:
     *       200:
     *         description: Status do usuário alterado
     *       404:
     *         description: Usuário não encontrado
     */
    async changeStatus(request: Request, response: Response) {
        const { id } = request.params;
        const { status } = request.body;
        // adminId viria do request.user.id se estiver autenticado
        const adminId = request.user?.id || "SYSTEM";

        const service = new ChangeUserStatusService();

        const result = await service.execute({
            userId: id,
            status,
            adminId
        });

        return response.json(result);
    }

    /**
    * @swagger
    * /users/{id}:
    *   delete:
    *     summary: Excluir usuário (Soft Delete)
    *     security:
    *       - bearerAuth: []
    *     tags: [Users]
    *     parameters:
    *       - in: path
    *         name: id
    *         required: true
    *         schema:
    *           type: string
    *     responses:
    *       200:
    *         description: Usuário excluído
    *       404:
    *         description: Usuário não encontrado
    */
    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const service = new DeleteUserService();

        const result = await service.execute({
            userId: id,
        });

        return response.json(result);
    }
}