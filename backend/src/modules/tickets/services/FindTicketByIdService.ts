import { TicketRepository } from "../repositories/TicketRepository";

interface IRequest {
  ticketId: string;
}

export class FindTicketByIdService {
  private repository = TicketRepository.getInstance();

  async execute({ ticketId }: IRequest) {

    const ticket =
      await this.repository.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  }
}