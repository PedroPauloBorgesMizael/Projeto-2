import { TicketRepository } from "../repositories/TicketRepository";
import { buildPaginatedResult } from "@/shared/utils/pagination";
import { Role } from "@prisma/client";

interface IRequest {
  userId: string;
  role: Role;
  pagination: { skip: number, take: number, page: number, limit: number };
  filters: any;
  sort: { field: string, order: "asc" | "desc" };
}

export class ListTicketsService {
  private repository = TicketRepository.getInstance();

  async execute({ userId, role, pagination, filters, sort }: IRequest) {

    const { tickets, total } =
      await this.repository.findMany({
        userId,
        role,
        skip: pagination.skip,
        take: pagination.take,
        filters,
        sort
      });

    return buildPaginatedResult(tickets, total, pagination.page, pagination.limit);
  }
}