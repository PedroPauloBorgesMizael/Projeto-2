import { TicketRepository } from "../repositories/TicketRepository";
import { AssignTechnicianDTO } from "../dtos/AssignTechnicianDTO";

export class AssignTechnicianService {
  private repository = TicketRepository.getInstance();

  async execute({
    ticketId,
    technicianId,
    userId,
  }: AssignTechnicianDTO & { userId: string }) {

    const technician =
      await this.repository.findUserById(technicianId);

    if (!technician) {
      throw new Error("Technician not found");
    }

    if (technician.role !== "TECHNICIAN") {
      throw new Error("User is not a technician");
    }

    const ticket =
      await this.repository.assignTechnician({
        ticketId,
        technicianId,
      });

    await this.repository.createHistory({
        ticketId,
        userId,
        action: "ASSIGNED",
        newValue: technicianId
    });

    return ticket;
  }
}