import { TicketRepository } from "../repositories/TicketRepository";
import { prisma } from "@/shared/database/prisma";

export class UpdateCategoryService {
  private repository = TicketRepository.getInstance();

  async execute({
    ticketId,
    categoryId,
    userId,
  }: { ticketId: string; categoryId: string; userId: string; }) {

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { categoryId }
    });

    await this.repository.createHistory({
        ticketId,
        userId,
        action: "STATUS_CHANGED", // reusing enum for simplicity or we can add CATEGORY_CHANGED if it exists
        newValue: `Categoria atualizada para ${categoryId}`
    });

    return ticket;
  }
}
