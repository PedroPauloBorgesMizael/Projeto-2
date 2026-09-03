import jwt from "jsonwebtoken";
import { env } from "@/config/env";

interface TokenPayload {
  sub: string;
  role: "ADMIN" | "TECHNICIAN" | "REQUESTER";
}

export class ValidateTokenService {
  execute(token: string) {
    const decoded = jwt.verify(
      token,
      env.jwt.secret
    ) as TokenPayload;

    return {
      userId: decoded.sub,
      role: decoded.role,
    };
  }
}