import { TicketStatus } from "@prisma/client";

export interface UpdateStatusDTO {
    ticketId: string;
    status: TicketStatus;
    userId: string;
}
