import { hash } from "bcryptjs";
import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { UserRepository } from "../repositories/UserRepository";

export class UpdateUserService {
  private repository = UserRepository.getInstance();

  async execute(userId: string, data: UpdateUserDTO) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (
      data.role &&
      !["ADMIN", "MANAGER", "ASSISTANT", "TECHNICIAN", "REQUESTER"].includes(
        data.role
      )
    ) {
      throw new Error("Perfil de usuário inválido.");
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.repository.findByEmail(data.email);
      if (emailExists) {
        throw new Error("Este e-mail já está sendo utilizado por outro usuário.");
      }
    }

    let passwordHash: string | undefined = undefined;
    if (data.password && data.password.trim().length > 0) {
      passwordHash = await hash(data.password, 8);
    }

    const updatedUser = await this.repository.update(userId, {
      ...data,
      password: passwordHash,
    });

    return updatedUser;
  }
}
