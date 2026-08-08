import { prisma } from "@/shared/database/prisma";
import { Prisma, Role, TicketStatus, TicketPriority } from "@prisma/client";

export class TicketRepository {
    private static INSTANCE: TicketRepository;

    private constructor() { }

    static getInstance() {
        if (!TicketRepository.INSTANCE) {
            TicketRepository.INSTANCE =
                new TicketRepository();
        }

        return TicketRepository.INSTANCE;
    }

    async findUserById(userId: string) {
        return prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
    }

    async create(data: any) {
        return prisma.ticket.create({
            data,
        });
    }

    async findById(ticketId: string) {
        return prisma.ticket.findUnique({
            where: {
                id: ticketId,
            },
            include: {
                requester: true,
                technician: true,
                comments: true,
                categoryRef: true,
                locationRef: true,
                team: true,
                attachments: true,
                history: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    },
                    orderBy: { createdAt: "desc" }
                }
            } as any,
        });
    }

    async assignTechnician({
        ticketId,
        technicianId,
    }: {
        ticketId: string;
        technicianId: string;
    }) {
        return prisma.ticket.update({
            where: {
                id: ticketId,
            },
            data: {
                technicianId,
                status: "ASSIGNED",
            },
        });
    }

    async findMany({
        userId,
        role,
        skip,
        take,
        filters,
        sort
    }: {
        userId: string;
        role: Role;
        skip: number;
        take: number;
        filters: any;
        sort: { field: string, order: "asc" | "desc" }
    }) {
        const where: Prisma.TicketWhereInput = {
            deletedAt: null
        };

        if (role === "REQUESTER") {
            where.requesterId = userId;
        } else if (role === "TECHNICIAN") {
            // Técnicos podem ver tickets atribuídos a eles ou não atribuídos da sua equipe (simplificação inicial)
            // Para não bloquear, exibimos todos se ele tiver permissão, ou podemos restringir depois.
            // Para ITSM, TECHNICIAN normalmente vê a própria fila.
            // Aqui manteremos simples, os filtros podem ser usados para buscar específicos.
        }

        if (filters.status) where.status = filters.status as TicketStatus;
        if (filters.priority) where.priority = filters.priority as TicketPriority;
        if (filters.categoryId) where.categoryId = filters.categoryId;
        if (filters.technicianId) where.technicianId = filters.technicianId;
        if (filters.requesterId) where.requesterId = filters.requesterId;
        if (filters.teamId) where.teamId = filters.teamId;
        if (filters.locationId) where.locationId = filters.locationId;
        
        if (filters.title) {
            where.title = { contains: filters.title, mode: "insensitive" };
        }
        if (filters.description) {
            where.description = { contains: filters.description, mode: "insensitive" };
        }

        if (filters.createdFrom || filters.createdTo) {
            where.createdAt = {};
            if (filters.createdFrom) where.createdAt.gte = new Date(filters.createdFrom);
            if (filters.createdTo) where.createdAt.lte = new Date(filters.createdTo);
        }

        if (filters.updatedFrom || filters.updatedTo) {
            where.updatedAt = {};
            if (filters.updatedFrom) where.updatedAt.gte = new Date(filters.updatedFrom);
            if (filters.updatedTo) where.updatedAt.lte = new Date(filters.updatedTo);
        }

        if (filters.completedFrom || filters.completedTo) {
            where.completedAt = {};
            if (filters.completedFrom) where.completedAt.gte = new Date(filters.completedFrom);
            if (filters.completedTo) where.completedAt.lte = new Date(filters.completedTo);
        }

        const orderBy: any = {};
        if (sort.field) {
            orderBy[sort.field] = sort.order || "asc";
        } else {
            orderBy.createdAt = "desc";
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    requester: { select: { id: true, name: true, email: true } },
                    technician: { select: { id: true, name: true, email: true } },
                    categoryRef: { select: { id: true, name: true } },
                    locationRef: { select: { id: true, name: true } },
                    team: { select: { id: true, name: true } },
                },
            }),
            prisma.ticket.count({ where })
        ]);

        return { tickets, total };
    }

    async updateStatus({
        ticketId,
        status,
        slaBreached,
    }: {
        ticketId: string;
        status: TicketStatus;
        slaBreached?: boolean;
    }) {
        return (prisma as any).ticket.update({
            where: {
                id: ticketId,
            },
            data: {
                status,
                completedAt: (status === "RESOLVED" || status === "CLOSED") ? new Date() : null,
                slaBreached: slaBreached !== undefined ? slaBreached : undefined,
            },
        });
    }

    async createHistory(data: {
        ticketId: string;
        userId: string;
        action: any; // TicketAction is not yet generated
        previousValue?: string;
        newValue?: string;
    }) {
        return (prisma as any).ticketHistory.create({
            data,
        });
    }

    async listHistory(ticketId: string) {
        return (prisma as any).ticketHistory.findMany({
            where: { ticketId },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async createAttachment(data: {
        ticketId: string;
        url: string;
        filename: string;
        mimetype: string;
        size: number;
    }) {
        return (prisma as any).attachment.create({
            data,
        });
    }

    async markSlaBreaches() {
        const now = new Date();
        const result = await (prisma as any).ticket.updateMany({
            where: {
                slaBreached: false,
                slaTargetDate: { lt: now },
                status: { notIn: ["RESOLVED", "CLOSED"] }
            },
            data: {
                slaBreached: true
            }
        });
        return result.count;
    }
}