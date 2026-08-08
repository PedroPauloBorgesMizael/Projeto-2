export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "ASSISTANT"
  | "TECHNICIAN"
  | "REQUESTER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export class User {
  id!: string;

  name!: string;
  email!: string;
  password!: string;

  role!: UserRole;

  status!: UserStatus;

  createdAt!: Date;
  deletedAt?: Date | null;
  deactivatedAt?: Date | null;
  deactivatedBy?: string | null;
  deactivationReason?: string | null;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }
}