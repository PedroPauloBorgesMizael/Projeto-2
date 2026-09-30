import { Request, Response } from "express";
import {
  CreateApprovalService,
  DecideApprovalService,
  ListTicketApprovalsService,
  CancelApprovalService,
} from "../services/ApprovalService";

export class ApprovalController {
  async create(request: Request, response: Response) {
    const { ticketId, approvalTypeId, approverUserId, approverTeamId, notes } = request.body;
    const requestedById = request.user?.id || request.body.requestedById;

    const service = new CreateApprovalService();
    const result = await service.execute({
      ticketId,
      approvalTypeId,
      requestedById,
      approverUserId,
      approverTeamId,
      notes,
    });

    return response.status(201).json(result);
  }

  async decide(request: Request, response: Response) {
    const { id } = request.params;
    const { decision, decisionNotes } = request.body;
    const userId = request.user?.id || request.body.userId;

    const service = new DecideApprovalService();
    const result = await service.execute({
      approvalId: id,
      userId,
      decision,
      decisionNotes,
    });

    return response.json(result);
  }

  async listByTicket(request: Request, response: Response) {
    const { ticketId } = request.params;
    const service = new ListTicketApprovalsService();
    const result = await service.execute(ticketId);
    return response.json(result);
  }

  async cancel(request: Request, response: Response) {
    const { id } = request.params;
    const userId = request.user?.id || request.body.userId;

    const service = new CancelApprovalService();
    const result = await service.execute({ approvalId: id, userId });
    return response.json(result);
  }
}
