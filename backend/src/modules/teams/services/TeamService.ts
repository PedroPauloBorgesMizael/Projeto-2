import { prisma } from "@/shared/database/prisma";
export class CreateTeamService {
    async execute(data: any) {
        return prisma.team.create({ data });
    }
}
export class ListTeamService {
    async execute() {
        return prisma.team.findMany();
    }
}