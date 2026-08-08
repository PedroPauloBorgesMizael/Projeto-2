import { UserRepository } from "../repositories/UserRepository";

interface IRequest {
  userId: string;
}

export class DeleteUserService {
  private repository = UserRepository.getInstance();

  async execute({ userId }: IRequest) {

    const userExists =
      await this.repository.findByIdWithRelations(userId);

    if (!userExists) {
      throw new Error("User not found");
    }

    if (
      userExists.ticketsRequested.length > 0 ||
      userExists.ticketsAssigned.length > 0 ||
      userExists.comments.length > 0
    ) {
      throw new Error(
        "User cannot be deleted because it has related records"
      );
    }

    await this.repository.softDelete(userId);

    return {
      message: "User deleted successfully",
    };
  }
}