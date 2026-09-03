import { CommentRepository } from "../repositories/CommentRepository";
import { CreateCommentDTO } from "../dtos/CreateCommentDTO";
import { prisma } from "@/shared/database/prisma";

export class AddCommentService {

  private commentRepository = new CommentRepository();

  async execute(data: CreateCommentDTO) {

    const ticketExists = await prisma.ticket.findUnique({
      where: {
        id: data.ticketId,
      },
    });

    if (!ticketExists) {
      throw new Error("Ticket not found");
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    return this.commentRepository.create(data);
  }
}