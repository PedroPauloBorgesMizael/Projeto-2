import { Request, Response, NextFunction } from "express";
import { ValidateTokenService } from "../services/ValidateTokenService";

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.status(401).json({
        message: "Token missing",
      });
    }

    const [, token] = authHeader.split(" ");

    const service = new ValidateTokenService();

    const { userId, role } = service.execute(token);

    request.user = {
      id: userId,
      role,
    };

    return next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return response.status(401).json({
        code: "token.expired",
        message: "Token expired",
      });
    }

    return response.status(401).json({
      message: "Token invalid",
    });
  }
}