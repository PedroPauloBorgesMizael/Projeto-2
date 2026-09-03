export class Comment {
  id!: string;
  message!: string;
  private!: boolean;
  ticketId!: string;
  userId!: string;
  createdAt!: Date;

  constructor(props: Comment) {
    Object.assign(this, props);
  }
}