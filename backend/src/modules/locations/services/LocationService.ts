import { prisma } from "@/shared/database/prisma";
export class CreateLocationService {
    async execute(data: any) {
        return prisma.location.create({ data });
    }
}
export class ListLocationService {
    async execute() {
        return prisma.location.findMany();
    }
}