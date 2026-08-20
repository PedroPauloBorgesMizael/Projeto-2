import { PrismaClient, Role, TicketPriority, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import process from "process";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // USERS

  const password = await bcrypt.hash("123456", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@helphome.com" },
      update: {},
      create: {
        name: "Administrador",
        email: "admin@helphome.com",
        password,
        role: Role.ADMIN,
      },
    }),

    prisma.user.upsert({
      where: { email: "carlos@helphome.com" },
      update: {},
      create: {
        name: "Carlos Técnico",
        email: "carlos@helphome.com",
        password,
        role: Role.TECHNICIAN,
      },
    }),

    prisma.user.upsert({
      where: { email: "fernanda@helphome.com" },
      update: {},
      create: {
        name: "Fernanda Técnica",
        email: "fernanda@helphome.com",
        password,
        role: Role.TECHNICIAN,
      },
    }),

    prisma.user.upsert({
      where: { email: "joao@helphome.com" },
      update: {},
      create: {
        name: "João Cliente",
        email: "joao@helphome.com",
        password,
        role: Role.REQUESTER,
      },
    }),

    prisma.user.upsert({
      where: { email: "maria@helphome.com" },
      update: {},
      create: {
        name: "Maria Cliente",
        email: "maria@helphome.com",
        password,
        role: Role.REQUESTER,
      },
    }),
  ]);

  const technicians = users.filter(
    (user) => user.role === Role.TECHNICIAN
  );

  const requesters = users.filter(
    (user) => user.role === Role.REQUESTER
  );

  // TICKETS + COMMENTS

  const categories = [
    "Elétrica",
    "Hidráulica",
    "Internet",
    "Limpeza",
    "Manutenção",
  ];

  const locations = [
    "Apartamento 101",
    "Casa 12",
    "Bloco B",
    "Recepção",
    "Sala 03",
  ];

  const priorities = [
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
  ];

  const statuses = [
    TicketStatus.NEW,
    TicketStatus.IN_PROGRESS,
    TicketStatus.PENDING,
    TicketStatus.CLOSED,
  ];

  for (let i = 1; i <= 20; i++) {
    const requester =
      requesters[Math.floor(Math.random() * requesters.length)];

    const technician =
      technicians[Math.floor(Math.random() * technicians.length)];

    const status =
      statuses[Math.floor(Math.random() * statuses.length)];

    const ticket = await prisma.ticket.create({
      data: {
        title: `Chamado #${i}`,
        description: `Descrição detalhada do chamado número ${i}.`,
        category:
          categories[Math.floor(Math.random() * categories.length)],
        priority:
          priorities[Math.floor(Math.random() * priorities.length)],
        status,
        location:
          locations[Math.floor(Math.random() * locations.length)],
        requesterId: requester.id,
        technicianId:
          status === TicketStatus.NEW ? null : technician.id,
        completedAt:
          status === TicketStatus.CLOSED ? new Date() : null,
      },
    });

    // Comentário obrigatório
    await prisma.comment.create({
      data: {
        message: `Comentário inicial do chamado #${i}.`,
        private: false,
        ticketId: ticket.id,
        userId: requester.id,
      },
    });

    // Comentário técnico adicional
    await prisma.comment.create({
      data: {
        message: `Atualização técnica do chamado #${i}.`,
        private: true,
        ticketId: ticket.id,
        userId: technician.id,
      },
    });
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