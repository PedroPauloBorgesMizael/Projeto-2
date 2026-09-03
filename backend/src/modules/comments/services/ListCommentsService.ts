import { CommentRepository } from "../repositories/CommentRepository";

interface IRequest {
  ticketId: string;
  role: "ADMIN" | "TECHNICIAN" | "REQUESTER";
}

export class ListCommentsService {

  private commentRepository =
    new CommentRepository();

  async execute({
    ticketId,
    role,
  }: IRequest) {

    if (!ticketId) {
      throw new Error("Ticket ID is required");
    }

    const comments =
      await this.commentRepository.findByTicket(ticketId);

    if (role === "REQUESTER") {
      return comments.filter(
        (comment) => !comment.private
      );
    }

    return comments;
  }
}