import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "@/config/env";
interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  role: Role;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("Token missing");
  }

  const [, token] = authHeader.split(" ");

  const decoded = jwt.verify(
    token,
    env.jwt.secret as string
  ) as TokenPayload;

  request.user = {
    id: decoded.sub,
    role: decoded.role,
  };

  next();
}