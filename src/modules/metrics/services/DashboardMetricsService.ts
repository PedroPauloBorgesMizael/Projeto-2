import { prisma } from "@/shared/database/prisma";

export class DashboardMetricsService {
  async execute() {
    // 1. Total abertos vs fechados
    const totalOpen = await prisma.ticket.count({
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] }
      }
    });

    const totalClosed = await prisma.ticket.count({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] }
      }
    });

    // 2. Agrupado por prioridade
    const priorities = await prisma.ticket.groupBy({
      by: ["priority"],
      _count: {
        priority: true,
      },
    });

    const priorityCounts = priorities.map((p) => ({
      priority: p.priority,
      count: p._count.priority,
    }));

    // 3. Chamados com SLA violado (abertos ou fechados, mas violados)
    const totalSlaBreached = await (prisma as any).ticket.count({
      where: {
        slaBreached: true
      }
    });

    return {
      status: {
        open: totalOpen,
        closed: totalClosed,
      },
      priorities: priorityCounts,
      sla: {
        breached: totalSlaBreached,
      },
    };
  }
}
