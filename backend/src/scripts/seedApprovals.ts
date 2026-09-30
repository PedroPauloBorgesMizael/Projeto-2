import { prisma } from "../shared/database/prisma";

async function main() {
  console.log("🌱 Sincronizando tipos padrão de aprovação...");
  const types = [
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

  for (const t of types) {
    const created = await prisma.approvalType.upsert({
      where: { name: t.name },
      update: { description: t.description, isActive: true },
      create: t,
    });
    console.log(`- ${created.name} pronto.`);
  }

  console.log("✅ Tipos de aprovação sincronizados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
