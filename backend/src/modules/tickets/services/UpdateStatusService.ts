import { TicketRepository } from "../repositories/TicketRepository";
import { UpdateStatusDTO } from "../dtos/UpdateStatusDTO";

export class UpdateStatusService {
  private repository = TicketRepository.getInstance();

  async execute({
    ticketId,
    status,
    userId, // Note: Need to add userId to DTO and controller
  }: UpdateStatusDTO & { userId: string }) {

    const ticketExists =
      await this.repository.findById(ticketId);

    if (!ticketExists) {
      throw new Error("Ticket not found");
    }

    if (ticketExists.status === status) {
      return ticketExists;
    }

    const isClosing = status === "RESOLVED" || status === "CLOSED";
    let slaBreached = (ticketExists as any).slaBreached;

    if (isClosing && (ticketExists as any).slaTargetDate && !slaBreached) {
      const { SlaCalculator } = require("@/shared/utils/SlaCalculator");
      slaBreached = SlaCalculator.isSlaBreached(ticketExists.slaTargetDate);
    }

    const ticket =
      await this.repository.updateStatus({
        ticketId,
        status,
        slaBreached: isClosing ? slaBreached : undefined,
      });

    await this.repository.createHistory({
        ticketId,
        userId,
        action: "STATUS_CHANGED",
        previousValue: ticketExists.status,
        newValue: status,
    });

    return ticket;
  }
}