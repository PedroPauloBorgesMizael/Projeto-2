import { TicketRepository } from "../repositories/TicketRepository";

interface IRequest {
  ticketId: string;
  userId: string;
  file: Express.Multer.File;
}

export class UploadAttachmentService {
  private repository = TicketRepository.getInstance();

  async execute({ ticketId, userId, file }: IRequest) {
    const ticketExists = await this.repository.findById(ticketId);

    if (!ticketExists) {
      throw new Error("Ticket not found");
    }

    const attachment = await this.repository.createAttachment({
      ticketId,
      url: "/uploads/" + file.filename,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    });

    await this.repository.createHistory({
      ticketId,
      userId,
      action: "ATTACHMENT_ADDED",
      newValue: file.filename
    });

    return attachment;
  }
}
