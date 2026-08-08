import { TicketRepository } from "../repositories/TicketRepository";

export class ListHistoryService {
  private repository = TicketRepository.getInstance();

  async execute({ ticketId }: { ticketId: string }) {
    const ticketExists = await this.repository.findById(ticketId);

    if (!ticketExists) {
      throw new Error("Ticket not found");
    }

    const history = await this.repository.listHistory(ticketId);

    return history;
  }
}
