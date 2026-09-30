import { prisma } from "@/shared/database/prisma";
import { CreateApprovalDTO } from "../dtos/CreateApprovalDTO";
import { DecideApprovalDTO } from "../dtos/DecideApprovalDTO";
import { ApprovalStatus, TicketAction, TicketStatus } from "@prisma/client";

export class CreateApprovalService {
  async execute({
    ticketId,
    approvalTypeId,
    requestedById,
    approverUserId,
    approverTeamId,
    notes,
  }: CreateApprovalDTO) {
    if (!approverUserId && !approverTeamId) {
      throw new Error("Você deve selecionar uma pessoa ou uma equipe responsável pela aprovação.");
    }

    if (approverUserId && approverTeamId) {
      throw new Error("Selecione apenas uma pessoa OU uma equipe como responsável pela aprovação.");
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: true,
        technician: true,
      },
    });

    if (!ticket) {
      throw new Error("Chamado não encontrado.");
    }

    if (ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED) {
      throw new Error("Não é possível solicitar aprovação para um chamado já resolvido ou fechado.");
    }

    const approvalType = await prisma.approvalType.findUnique({
      where: { id: approvalTypeId },
    });

    if (!approvalType) {
      throw new Error("Tipo de aprovação não encontrado.");
    }

    if (!approvalType.isActive) {
      throw new Error("Este tipo de aprovação está inativo.");
    }

    let targetName = "";
    if (approverUserId) {
      const user = await prisma.user.findUnique({ where: { id: approverUserId } });
      if (!user) throw new Error("Usuário aprovador não encontrado.");
      targetName = user.name;
    } else if (approverTeamId) {
      const team = await prisma.team.findUnique({ where: { id: approverTeamId } });
      if (!team) throw new Error("Equipe aprovadora não encontrada.");
      targetName = `Equipe ${team.name}`;
    }

    const requester = await prisma.user.findUnique({
      where: { id: requestedById },
    });

    const approval = await prisma.approval.create({
      data: {
        ticketId,
        approvalTypeId,
        requestedById,
        approverUserId: approverUserId || null,
        approverTeamId: approverTeamId || null,
        status: ApprovalStatus.PENDING,
        notes: notes?.trim() || null,
      },
      include: {
        approvalType: true,
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverTeam: {
          select: { id: true, name: true },
        },
        decidedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Registra no histórico do chamado
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId,
          userId: requestedById,
          action: TicketAction.APPROVAL_REQUESTED,
          previousValue: null,
          newValue: `${approvalType.name} (Destinatário: ${targetName})`,
        },
      });
    } catch {
      // continua mesmo se o enum de histórico tiver discrepância
    }

    // Cria um comentário automático informativo no chamado
    await prisma.comment.create({
      data: {
        ticketId,
        userId: requestedById,
        private: true,
        message: `📋 [Solicitação de Aprovação]\nTipo: ${approvalType.name}\nDestinatário: ${targetName}\nSolicitado por: ${requester?.name || 'Técnico'}\n${notes ? `Observações: ${notes}` : ''}`,
      },
    });

    return approval;
  }
}

export class DecideApprovalService {
  async execute({ approvalId, userId, decision, decisionNotes }: DecideApprovalDTO) {
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        approvalType: true,
        approverUser: true,
        approverTeam: {
          include: {
            members: {
              where: { deletedAt: null },
              select: { id: true },
            },
          },
        },
        requestedBy: true,
        ticket: true,
      },
    });

    if (!approval) {
      throw new Error("Solicitação de aprovação não encontrada.");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error(`Esta aprovação já foi respondida com status: ${approval.status}.`);
    }

    const decidingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!decidingUser) {
      throw new Error("Usuário avaliador não encontrado.");
    }

    // Checagem de permissão:
    // 1. Se for o próprio usuário definido como approverUserId
    // 2. Se pertencer à equipe definida em approverTeamId
    // 3. Se for ADMIN ou MANAGER
    const isDirectApprover = approval.approverUserId === userId;
    const isInApproverTeam = approval.approverTeam?.members.some((m) => m.id === userId);
    const isPrivileged = decidingUser.role === "ADMIN" || decidingUser.role === "MANAGER";

    if (!isDirectApprover && !isInApproverTeam && !isPrivileged) {
      throw new Error("Você não tem autorização para responder a esta solicitação de aprovação.");
    }

    const status = decision === "APPROVED" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status,
        decidedAt: new Date(),
        decidedById: userId,
        decisionNotes: decisionNotes?.trim() || null,
      },
      include: {
        approvalType: true,
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverTeam: {
          select: { id: true, name: true },
        },
        decidedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Registra no histórico do chamado
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: approval.ticketId,
          userId,
          action: decision === "APPROVED" ? TicketAction.APPROVAL_APPROVED : TicketAction.APPROVAL_REJECTED,
          previousValue: "PENDING",
          newValue: `${decision} - ${approval.approvalType.name}`,
        },
      });
    } catch {
      // Ignora erro de histórico se houver
    }

    // Adiciona comentário informativo
    const decisionLabel = decision === "APPROVED" ? "✅ APROVADA" : "❌ REJEITADA";
    await prisma.comment.create({
      data: {
        ticketId: approval.ticketId,
        userId,
        private: false,
        message: `🔔 [Aprovação Respondida - ${decisionLabel}]\nTipo: ${approval.approvalType.name}\nAvaliado por: ${decidingUser.name}\nDecisão: ${decision === "APPROVED" ? "Aprovado" : "Rejeitado"}\n${decisionNotes ? `Parecer/Justificativa: ${decisionNotes}` : ''}`,
      },
    });

    return updatedApproval;
  }
}

export class ListTicketApprovalsService {
  async execute(ticketId: string) {
    return prisma.approval.findMany({
      where: { ticketId },
      include: {
        approvalType: true,
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        approverTeam: {
          select: { id: true, name: true },
        },
        decidedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export class CancelApprovalService {
  async execute({ approvalId, userId }: { approvalId: string; userId: string }) {
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        approvalType: true,
      },
    });

    if (!approval) {
      throw new Error("Aprovação não encontrada.");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error("Apenas aprovações pendentes podem ser canceladas.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado.");

    if (approval.requestedById !== userId && user.role !== "ADMIN" && user.role !== "MANAGER") {
      throw new Error("Apenas quem solicitou a aprovação ou um Administrador pode cancelá-la.");
    }

    const updated = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: ApprovalStatus.CANCELLED,
        decidedAt: new Date(),
        decidedById: userId,
        decisionNotes: "Solicitação de aprovação cancelada.",
      },
      include: {
        approvalType: true,
        requestedBy: { select: { id: true, name: true, email: true } },
        approverUser: { select: { id: true, name: true, email: true } },
        approverTeam: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: approval.ticketId,
          userId,
          action: TicketAction.APPROVAL_CANCELLED,
          previousValue: "PENDING",
          newValue: `CANCELLED - ${approval.approvalType.name}`,
        },
      });
    } catch {
      // Ignora erro de histórico
    }

    return updated;
  }
}
