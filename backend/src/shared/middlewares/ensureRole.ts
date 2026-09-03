import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export function ensureRole(allowedRoles: Role[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const userRole = request.user?.role as Role;

    if (!userRole) {
      return response.status(401).json({ error: "Role not found in token" });
    }

    if (!allowedRoles.includes(userRole)) {
      return response.status(403).json({ error: "Access denied" });
    }

    return next();
  };
}
