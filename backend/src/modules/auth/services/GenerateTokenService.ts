import jwt from "jsonwebtoken";
import { env } from "@/config/env";

interface GenerateTokenDTO {
  userId: string;
  role: "ADMIN" | "TECHNICIAN" | "REQUESTER";
}

export class GenerateTokenService {
  execute({ userId, role }: GenerateTokenDTO) {
    const token = jwt.sign(
      {
        role,
      },
      env.jwt.secret,
      {
        subject: userId,
        expiresIn: "1d",
      }
    );

    return token;
  }
}