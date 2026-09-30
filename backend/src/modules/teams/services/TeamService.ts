import { prisma } from "@/shared/database/prisma";

interface CreateTeamInput {
  name: string;
  description?: string;
  memberIds?: string[];
}

interface UpdateTeamInput {
  id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
}

export class CreateTeamService {
  async execute({ name, description, memberIds }: CreateTeamInput) {
    const teamExists = await prisma.team.findUnique({
      where: { name },
    });

    if (teamExists) {
      throw new Error("Uma equipe com este nome já existe.");
    }

    return prisma.team.create({
      data: {
        name,
        description,
        ...(memberIds && memberIds.length > 0
          ? {
              members: {
                connect: memberIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            members: true,
            tickets: true,
          },
        },
      },
    });
  }
}

export class ListTeamService {
  async execute() {
    return prisma.team.findMany({
      include: {
        members: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            members: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export class UpdateTeamService {
  async execute({ id, name, description, memberIds }: UpdateTeamInput) {
    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new Error("Equipe não encontrada.");
    }

    if (name && name !== team.name) {
      const nameExists = await prisma.team.findUnique({
        where: { name },
      });
      if (nameExists) {
        throw new Error("Uma equipe com este nome já existe.");
      }
    }

    return prisma.team.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(memberIds !== undefined
          ? {
              members: {
                set: memberIds.map((memberId) => ({ id: memberId })),
              },
            }
          : {}),
      },
      include: {
        members: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            members: true,
            tickets: true,
          },
        },
      },
    });
  }
}

export class UpdateTeamMembersService {
  async execute({ teamId, memberIds }: { teamId: string; memberIds: string[] }) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Equipe não encontrada.");
    }

    return prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          set: memberIds.map((id) => ({ id })),
        },
      },
      include: {
        members: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            members: true,
            tickets: true,
          },
        },
      },
    });
  }
}

export class DeleteTeamService {
  async execute(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new Error("Equipe não encontrada.");
    }

    return prisma.team.delete({
      where: { id },
    });
  }
}