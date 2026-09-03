import { Request, Response } from "express";

import { AddCommentService } from "../services/AddCommentService";
import { ListCommentsService } from "../services/ListCommentsService";

export class CommentController {

  /**
   * @swagger
   * /comments:
   *   post:
   *     summary: Adiciona um comentário ao ticket
   *     tags:
   *       - Comments
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *               private:
   *                 type: boolean
   *               ticketId:
   *                 type: string
   *               userId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Comentário criado com sucesso
   */
  async create(request: Request, response: Response) {

    const { message, private: isPrivate, ticketId, userId } = request.body;

    const service = new AddCommentService();

    const result = await service.execute({
      message,
      private: isPrivate,
      ticketId,
      userId,
    });

    return response.status(201).json(result);
  }

  /**
   * @swagger
   * /comments/{ticketId}:
   *   get:
   *     summary: Lista comentários de um ticket
   *     tags:
   *       - Comments
   *     parameters:
   *       - in: path
   *         name: ticketId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de comentários
   */
  async list(request: Request, response: Response) {
    const { ticketId } = request.params;

    const service = new ListCommentsService();

    const result = await service.execute({
      ticketId,
      role: request.user.role as "ADMIN" | "TECHNICIAN" | "REQUESTER",
    });

    return response.json(result);
  }
}