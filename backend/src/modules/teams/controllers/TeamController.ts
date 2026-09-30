import { Request, Response } from "express";
import {
  CreateTeamService,
  ListTeamService,
  UpdateTeamService,
  UpdateTeamMembersService,
  DeleteTeamService,
} from "../services/TeamService";

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
   *               memberIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Sucesso
   */
  async create(request: Request, response: Response) {
    const { name, description, memberIds } = request.body;
    const service = new CreateTeamService();
    const result = await service.execute({ name, description, memberIds });
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

  /**
   * @swagger
   * /teams/{id}:
   *   put:
   *     summary: Atualizar time e membros
   *     security:
   *       - bearerAuth: []
   *     tags: [teams]
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
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               memberIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Sucesso
   */
  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, description, memberIds } = request.body;
    const service = new UpdateTeamService();
    const result = await service.execute({ id, name, description, memberIds });
    return response.json(result);
  }

  /**
   * @swagger
   * /teams/{id}/members:
   *   put:
   *     summary: Atualizar membros de um time
   *     security:
   *       - bearerAuth: []
   *     tags: [teams]
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
   *               memberIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Sucesso
   */
  async updateMembers(request: Request, response: Response) {
    const { id } = request.params;
    const { memberIds } = request.body;
    const service = new UpdateTeamMembersService();
    const result = await service.execute({ teamId: id, memberIds: memberIds || [] });
    return response.json(result);
  }

  /**
   * @swagger
   * /teams/{id}:
   *   delete:
   *     summary: Excluir time
   *     security:
   *       - bearerAuth: []
   *     tags: [teams]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Sucesso
   */
  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const service = new DeleteTeamService();
    const result = await service.execute(id);
    return response.json(result);
  }
}