import { prisma } from "@/shared/database/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export class AuthenticateUserService {
  async execute({ email, password }: any) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Inactive user");
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      env.jwt.secret as string,
      {
        subject: user.id,
        expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
      }
    );

    return {
      user,
      token,
    };
  }
}