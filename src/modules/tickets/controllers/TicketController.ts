import { Request, Response } from "express";

import { CreateTicketService } from "../services/CreateTicketService";
import { ListTicketsService } from "../services/ListTicketsService";
import { FindTicketByIdService } from "../services/FindTicketByIdService";
import { UpdateStatusService } from "../services/UpdateStatusService";
import { AssignTechnicianService } from "../services/AssignTechnicianService";

export class TicketController {

    /**
     * @swagger
     * /tickets:
     *   post:
     *     summary: Criar chamado
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               category:
     *                 type: string
     *               priority:
     *                 type: string
     *                 enum: ["LOW", "MEDIUM", "HIGH"]
     *               location:
     *                 type: string
     *     responses:
     *       201:
     *         description: Chamado criado com sucesso
     *       401:
     *         description: Não autenticado
     */
    async create(request: Request, response: Response) {

        const {
            title,
            description,
            category,
            priority,
            location,
        } = request.body;

        const service = new CreateTicketService();

        const result = await service.execute({
            title,
            description,
            category,
            priority,
            location,
            requesterId: request.user.id,
        });

        return response.status(201).json(result);
    }

    /**
     * @swagger
     * /tickets:
     *   get:
     *     summary: Listar chamados
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
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
     *         name: status
     *         schema:
     *           type: string
     *       - in: query
     *         name: priority
     *         schema:
     *           type: string
     *       - in: query
     *         name: categoryId
     *         schema:
     *           type: string
     *       - in: query
     *         name: technicianId
     *         schema:
     *           type: string
     *       - in: query
     *         name: requesterId
     *         schema:
     *           type: string
     *       - in: query
     *         name: teamId
     *         schema:
     *           type: string
     *       - in: query
     *         name: locationId
     *         schema:
     *           type: string
     *       - in: query
     *         name: title
     *         schema:
     *           type: string
     *       - in: query
     *         name: sortField
     *         schema:
     *           type: string
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *     responses:
     *       200:
     *         description: Lista paginada de chamados
     *       401:
     *         description: Não autenticado
     */
    async list(request: Request, response: Response) {
        const { getPaginationParams } = require("@/shared/utils/pagination");
        const pagination = getPaginationParams(request.query);
        const {
            status, priority, categoryId, technicianId, requesterId, 
            teamId, locationId, title, description, sortField, sortOrder,
            createdFrom, createdTo, updatedFrom, updatedTo, completedFrom, completedTo
        } = request.query;

        const service = new ListTicketsService();

        const tickets = await service.execute({
            userId: request.user.id,
            role: request.user.role as "ADMIN" | "MANAGER" | "ASSISTANT" | "TECHNICIAN" | "REQUESTER",
            pagination,
            filters: {
                status: status as string,
                priority: priority as string,
                categoryId: categoryId as string,
                technicianId: technicianId as string,
                requesterId: requesterId as string,
                teamId: teamId as string,
                locationId: locationId as string,
                title: title as string,
                description: description as string,
                createdFrom: createdFrom as string,
                createdTo: createdTo as string,
                updatedFrom: updatedFrom as string,
                updatedTo: updatedTo as string,
                completedFrom: completedFrom as string,
                completedTo: completedTo as string,
            },
            sort: {
                field: sortField as string,
                order: sortOrder as 'asc' | 'desc'
            }
        });

        return response.json(tickets);
    }

    /**
     * @swagger
     * /tickets/{id}:
     *   get:
     *     summary: Buscar chamado por ID
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Chamado encontrado
     *       404:
     *         description: Chamado não encontrado
     */
    async findById(request: Request, response: Response) {

        const { id } = request.params;

        const service = new FindTicketByIdService();

        const result = await service.execute({
            ticketId: id,
        });

        return response.json(result);
    }

    /**
     * @swagger
     * /tickets/{id}/status:
     *   patch:
     *     summary: Atualizar status do chamado
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
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
     *                 enum: ["OPEN", "IN_PROGRESS", "PENDING", "CLOSED"]
     *                 example: IN_PROGRESS
     *     responses:
     *       200:
     *         description: Status atualizado
     *       404:
     *         description: Chamado não encontrado
     */
    async updateStatus(request: Request, response: Response) {

        const { id } = request.params;
        const { status } = request.body;
        const userId = request.user.id;

        const service = new UpdateStatusService();

        const result = await service.execute({
            ticketId: id,
            status,
            userId
        });

        return response.json(result);
    }

    /**
     * @swagger
     * /tickets/{id}/assign:
     *   patch:
     *     summary: Atribuir técnico ao chamado
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
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
     *               technicianId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Técnico atribuído
     *       404:
     *         description: Técnico não encontrado
     */
    async assignTechnician(
        request: Request,
        response: Response
    ) {

        const { id } = request.params;
        const { technicianId } = request.body;
        const userId = request.user.id;

        const service = new AssignTechnicianService();

        const result = await service.execute({
            ticketId: id,
            technicianId,
            userId,
        });

        return response.json(result);
    }

    /**
     * @swagger
     * /tickets/{id}/history:
     *   get:
     *     summary: Buscar histórico do chamado
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Histórico encontrado
     *       404:
     *         description: Chamado não encontrado
     */
    async listHistory(request: Request, response: Response) {
        const { id } = request.params;
        
        const { ListHistoryService } = require("../services/ListHistoryService");
        const service = new ListHistoryService();

        const result = await service.execute({
            ticketId: id,
        });

        return response.json(result);
    }

    /**
     * @swagger
     * /tickets/{id}/attachments:
     *   post:
     *     summary: Fazer upload de anexo para o chamado
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *     responses:
     *       201:
     *         description: Anexo criado com sucesso
     */
    async uploadAttachment(request: Request, response: Response) {
        const { id } = request.params;
        const file = request.file;
        const userId = request.user.id;

        if (!file) {
            return response.status(400).json({ error: "File is required" });
        }

        const { UploadAttachmentService } = require("../services/UploadAttachmentService");
        const service = new UploadAttachmentService();

        const result = await service.execute({
            ticketId: id,
            userId,
            file,
        });

        return response.status(201).json(result);
    }

    /**
     * @swagger
     * /tickets/sla-check:
     *   post:
     *     summary: Verificar e atualizar violações de SLA (Geralmente via Cron)
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     responses:
     *       200:
     *         description: Verificação de SLA concluída
     */
    async checkSlaBreaches(request: Request, response: Response) {
        const { CheckSlaBreachesService } = require("../services/CheckSlaBreachesService");
        const service = new CheckSlaBreachesService();

        const result = await service.execute();

        return response.json(result);
    }

    /**
     * @swagger
     * /tickets/export/pdf:
     *   get:
     *     summary: Exportar listagem de chamados em PDF
     *     security:
     *       - bearerAuth: []
     *     tags: [Tickets]
     *     responses:
     *       200:
     *         description: Arquivo PDF
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     */
    async exportPdf(request: Request, response: Response) {
        const { TicketReportService } = require("../services/TicketReportService");
        const service = new TicketReportService();
        // O próprio serviço injeta o pipe e responde, não usamos return response.json
        await service.execute(response, request.user.id, request.user.role);
    }
}