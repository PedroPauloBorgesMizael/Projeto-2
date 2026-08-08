import { hash } from "bcryptjs";

import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { UserRole } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";

export class CreateUserService {
  private repository = UserRepository.getInstance();

  async execute({
    name,
    email,
    password,
    role,
  }: CreateUserDTO) {

    if (
      !["ADMIN", "MANAGER", "ASSISTANT", "TECHNICIAN", "REQUESTER"]
        .includes(role)
    ) {
      throw new Error("Invalid role");
    }

    const userExists =
      await this.repository.findByEmail(email);

    if (userExists) {
      throw new Error("User already exists");
    }

    const passwordHash =
      await hash(password, 8);

    const user =
      await this.repository.create({
        name,
        email,
        password: passwordHash,
        role: role as any,
      });

    return user;
  }
}