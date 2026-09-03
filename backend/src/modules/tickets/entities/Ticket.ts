export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING"
  | "CLOSED";

export class Ticket {
  id!: string;

  title!: string;
  description!: string;
  category!: string;
  priority!: TicketPriority;
  status!: TicketStatus;

  location!: string;

  requesterId!: string;

  technicianId?: string | null;

  createdAt!: Date;
  updatedAt!: Date;

  constructor(props: Ticket) {
    Object.assign(this, props);
  }
}