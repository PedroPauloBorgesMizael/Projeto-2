import { prisma } from "@/shared/database/prisma";
import { CreateCommentDTO } from "../dtos/CreateCommentDTO";

export class CommentRepository {

  async create(data: CreateCommentDTO) {
    return prisma.comment.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return prisma.comment.findMany({
      where: {
        ticketId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}