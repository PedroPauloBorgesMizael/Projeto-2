import { prisma } from "@/shared/database/prisma";
import { UserStatus } from "@prisma/client";

interface IRequest {
  userId: string;
  status: UserStatus;
  adminId: string;
}

export class ChangeUserStatusService {
  async execute({ userId, status, adminId }: IRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    
    // Se estiver inativando, atualiza os dados adicionais
    let deactivatedAt = user.deactivatedAt;
    let deactivatedBy = user.deactivatedBy;
    
    if (status === "INACTIVE" && user.status === "ACTIVE") {
      deactivatedAt = new Date();
      deactivatedBy = adminId;
    } else if (status === "ACTIVE" && user.status === "INACTIVE") {
      deactivatedAt = null;
      deactivatedBy = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status,
        deactivatedAt,
        deactivatedBy
      },
    });

    return updatedUser;
  }
}
