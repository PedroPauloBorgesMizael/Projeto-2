import { UserRepository } from "../repositories/UserRepository";
import { buildPaginatedResult } from "@/shared/utils/pagination";

interface IRequest {
    pagination: { skip: number, take: number, page: number, limit: number };
    filters: { name?: string, role?: string, status?: string };
}

export class ListUsersService {
  private repository = UserRepository.getInstance();

  async execute({ pagination, filters }: IRequest) {
    const { users, total } = await this.repository.findAll({
      skip: pagination.skip,
      take: pagination.take,
      filters
    });

    return buildPaginatedResult(users, total, pagination.page, pagination.limit);
  }
}