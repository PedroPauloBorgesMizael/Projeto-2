import { prisma } from "@/shared/database/prisma";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { Prisma, UserStatus } from "@prisma/client";

export class UserRepository {
  private static INSTANCE: UserRepository;

  private constructor() { }

  static getInstance() {
    if (!UserRepository.INSTANCE) {
      UserRepository.INSTANCE =
        new UserRepository();
    }

    return UserRepository.INSTANCE;
  }

  async create(data: CreateUserDTO) {
    return prisma.user.create({
      data,
    });
  }

  async findAll({
    skip,
    take,
    filters,
  }: {
    skip: number;
    take: number;
    filters: { name?: string; role?: string; status?: string };
  }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }
    if (filters.role) {
      where.role = filters.role as any;
    }
    if (filters.status) {
      where.status = filters.status as UserStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async changeStatus(userId: string, status: UserStatus, deactivatedAt: Date | null, deactivatedBy: string | null) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
        deactivatedAt,
        deactivatedBy
      },
    });
  }

  async softDelete(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE"
      },
    });
  }

  async findByIdWithRelations(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        ticketsRequested: true,
        ticketsAssigned: true,
        comments: true,
      },
    });
  }
}