import { CreateTicketDTO } from "../dtos/CreateTicketDTO";
import { TicketRepository } from "../repositories/TicketRepository";
import { SlaCalculator } from "@/shared/utils/SlaCalculator";

export class CreateTicketService {
  private repository = TicketRepository.getInstance();

  async execute({
    title,
    description,
    category,
    categoryId,
    priority,
    location,
    locationId,
    requesterId,
  }: CreateTicketDTO) {

    const requester =
      await this.repository.findUserById(requesterId);

    if (!requester) {
      throw new Error("Requester not found");
    }

    if (requester.status !== "ACTIVE") {
      throw new Error("Inactive user");
    }

    // Se o usuário não enviou prioridade, assume MEDIUM ou a default do BD. 
    // Em uma triagem, a prioridade pode ser ajustada.
    const calculatedPriority = priority || "MEDIUM";
    const slaTargetDate = SlaCalculator.calculateSlaTarget(calculatedPriority);

    const ticket =
      await this.repository.create({
        title,
        description,
        category,
        categoryId,
        priority: calculatedPriority,
        location,
        locationId,
        requesterId,
        // Status inicial OPEN/NEW dependendo da role ou fluxo
        status: "OPEN",
        slaTargetDate
      });

    await this.repository.createHistory({
        ticketId: ticket.id,
        userId: requesterId,
        action: "CREATED",
    });

    return ticket;
  }
}