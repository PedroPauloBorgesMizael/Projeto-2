import { TicketRepository } from "../repositories/TicketRepository";

export class CheckSlaBreachesService {
  private repository = TicketRepository.getInstance();

  async execute() {
    const breachedCount = await this.repository.markSlaBreaches();

    return {
      message: "SLA check completed",
      breachedTicketsCount: breachedCount
    };
  }
}
