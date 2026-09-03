import { PrismaClient, Role, TicketPriority, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import process from "process";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  console.log("🧹 Limpando banco de dados...");
  await prisma.ticketHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.category.deleteMany();
  // Location and users
  await prisma.user.updateMany({ data: { locationId: null } });
  await prisma.location.deleteMany();

  console.log("🌱 Criando Categorias e Localizações...");
  const catEletrica = await prisma.category.create({ data: { name: "Elétrica" } });
  const catHidraulica = await prisma.category.create({ data: { name: "Hidráulica" } });
  const catLimpeza = await prisma.category.create({ data: { name: "Limpeza" } });
  const categories = [catEletrica, catHidraulica, catLimpeza];

  const locAp101 = await prisma.location.create({ data: { name: "Apartamento 101" } });
  const locAp102 = await prisma.location.create({ data: { name: "Apartamento 102" } });
  const locExterna = await prisma.location.create({ data: { name: "Área de Lazer" } });
  const locations = [locAp101, locAp102, locExterna];

  console.log("👤 Criando Usuários...");
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@helphome.com" },
    update: {},
    create: { name: "Administrador", email: "admin@helphome.com", password, role: Role.ADMIN },
  });

  const tech1 = await prisma.user.upsert({
    where: { email: "carlos@helphome.com" },
    update: {},
    create: { name: "Carlos Técnico", email: "carlos@helphome.com", password, role: Role.TECHNICIAN },
  });

  const client1 = await prisma.user.upsert({
    where: { email: "joao@helphome.com" },
    update: { locationId: locAp101.id },
    create: { name: "João Cliente", email: "joao@helphome.com", password, role: Role.REQUESTER, locationId: locAp101.id },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "maria@helphome.com" },
    update: { locationId: locAp102.id },
    create: { name: "Maria Cliente", email: "maria@helphome.com", password, role: Role.REQUESTER, locationId: locAp102.id },
  });

  const requesters = [client1, client2];
  const technicians = [tech1];

  const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.CRITICAL];
  const statuses = [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];

  console.log("🎫 Criando Chamados e Comentários...");
  for (let i = 1; i <= 10; i++) {
    const requester = requesters[i % 2];
    const technician = technicians[0];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    const ticket = await prisma.ticket.create({
      data: {
        title: `Chamado Teste #${i}`,
        description: `Descrição detalhada do chamado de teste número ${i}. Problema encontrado no local.`,
        categoryId: category.id,
        category: category.name, // mantendo string tb por compatibilidade
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        locationId: location.id,
        requesterId: requester.id,
        technicianId: status === TicketStatus.NEW ? null : technician.id,
        completedAt: (status === TicketStatus.CLOSED || status === TicketStatus.RESOLVED) ? new Date() : null,
      },
    });

    await prisma.comment.create({
      data: {
        message: `Comentário inicial explicando o problema do chamado #${i}. Aguardando retorno.`,
        private: false,
        ticketId: ticket.id,
        userId: requester.id,
      },
    });

    if (status !== TicketStatus.NEW) {
      await prisma.comment.create({
        data: {
          message: `O técnico analisou a situação do chamado #${i} e a peça foi encomendada.`,
          private: false,
          ticketId: ticket.id,
          userId: technician.id,
        },
      });
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });