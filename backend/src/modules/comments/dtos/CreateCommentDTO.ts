export interface CreateCommentDTO {
  message: string;
  private?: boolean;
  ticketId: string;
  userId: string;
}