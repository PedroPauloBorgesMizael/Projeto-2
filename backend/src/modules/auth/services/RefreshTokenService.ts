import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { prisma } from "@/shared/database/prisma";

export class RefreshTokenService {
  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token missing");
    }

    try {
      const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret as string) as {
        sub: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("Inactive user");
      }

      const newToken = jwt.sign(
        {
          role: user.role,
        },
        env.jwt.secret as string,
        {
          subject: user.id,
          expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
        }
      );

      const newRefreshToken = jwt.sign(
        {
          role: user.role,
        },
        env.jwt.refreshSecret as string,
        {
          subject: user.id,
          expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
        }
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}
