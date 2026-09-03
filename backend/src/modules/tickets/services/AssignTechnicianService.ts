import { TicketRepository } from "../repositories/TicketRepository";

export class AssignTechnicianService {
  private repository = TicketRepository.getInstance();

  async execute({
    ticketId,
    technicianId,
    teamId,
    userId,
  }: { ticketId: string, technicianId?: string, teamId?: string, userId: string }) {

    if (technicianId) {
      const technician = await this.repository.findUserById(technicianId);
      if (!technician) {
        throw new Error("Technician not found");
      }
      // If role check is needed, we could add it back here, but ADMIN/MANAGER can also be assigned in some systems.
    }

    const ticket =
      await this.repository.assignTechnician({
        ticketId,
        technicianId,
        teamId,
      });

    await this.repository.createHistory({
        ticketId,
        userId,
        action: "ASSIGNED",
        newValue: technicianId ? `Técnico: ${technicianId}` : `Time: ${teamId}`
    });

    return ticket;
  }
}