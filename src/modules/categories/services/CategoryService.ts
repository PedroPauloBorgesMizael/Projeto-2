import { prisma } from "@/shared/database/prisma";
export class CreateCategoryService {
    async execute(data: any) {
        return prisma.category.create({ data });
    }
}
export class ListCategoryService {
    async execute() {
        return prisma.category.findMany();
    }
}