import { prisma } from "@/shared/database/prisma";
import { CreateApprovalTypeDTO } from "../dtos/CreateApprovalTypeDTO";
import { UpdateApprovalTypeDTO } from "../dtos/UpdateApprovalTypeDTO";

export class ListApprovalTypeService {
  async execute(onlyActive: boolean = false) {
    return prisma.approvalType.findMany({
      where: onlyActive ? { isActive: true } : {},
      include: {
        _count: {
          select: {
            approvals: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export class CreateApprovalTypeService {
  async execute({ name, description, isActive = true }: CreateApprovalTypeDTO) {
    if (!name || !name.trim()) {
      throw new Error("O nome do tipo de aprovação é obrigatório.");
    }

    const exists = await prisma.approvalType.findUnique({
      where: { name: name.trim() },
    });

    if (exists) {
      throw new Error("Já existe um tipo de aprovação com este nome.");
    }

    return prisma.approvalType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive,
      },
    });
  }
}

export class UpdateApprovalTypeService {
  async execute(id: string, { name, description, isActive }: UpdateApprovalTypeDTO) {
    const approvalType = await prisma.approvalType.findUnique({
      where: { id },
    });

    if (!approvalType) {
      throw new Error("Tipo de aprovação não encontrado.");
    }

    if (name && name.trim() !== approvalType.name) {
      const exists = await prisma.approvalType.findUnique({
        where: { name: name.trim() },
      });

      if (exists) {
        throw new Error("Já existe um tipo de aprovação com este nome.");
      }
    }

    return prisma.approvalType.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }
}

export class DeleteApprovalTypeService {
  async execute(id: string) {
    const approvalType = await prisma.approvalType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            approvals: true,
          },
        },
      },
    });

    if (!approvalType) {
      throw new Error("Tipo de aprovação não encontrado.");
    }

    if (approvalType._count.approvals > 0) {
      // Se já houver aprovações atreladas, apenas desativa para manter integridade histórica
      return prisma.approvalType.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.approvalType.delete({
      where: { id },
    });
  }
}

export class SeedApprovalTypesService {
  async execute() {
    const defaults = [
      {
        name: "Aprovação de Orçamento",
        description: "Validação de custos, cotações e compras de materiais para execução do serviço.",
      },
      {
        name: "Aprovação de Serviço",
        description: "Autorização para início ou escopo técnico da execução do reparo/serviço.",
      },
      {
        name: "Aprovação de Horário",
        description: "Autorização de agenda, visita técnica ou trabalho fora do expediente padrão.",
      },
      {
        name: "Aprovação de Compra de Peças",
        description: "Autorização para substituição e aquisição de peças de reposição específicas.",
      },
    ];

    for (const item of defaults) {
      const exists = await prisma.approvalType.findUnique({
        where: { name: item.name },
      });

      if (!exists) {
        await prisma.approvalType.create({
          data: item,
        });
      }
    }
  }
}
