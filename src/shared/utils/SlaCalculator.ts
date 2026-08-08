import { TicketPriority } from "@prisma/client";

export class SlaCalculator {
  /**
   * Calcula a data limite (SLA Target) baseado na prioridade do chamado.
   * Regras padrão em horas corridas (simplificado para Phase 3):
   * - CRITICAL: 4 horas
   * - HIGH: 24 horas
   * - MEDIUM: 72 horas (3 dias)
   * - LOW: 168 horas (7 dias)
   */
  static calculateSlaTarget(priority: TicketPriority, startDate: Date = new Date()): Date {
    const hoursToAdd = this.getHoursByPriority(priority);
    const targetDate = new Date(startDate.getTime());
    targetDate.setHours(targetDate.getHours() + hoursToAdd);
    return targetDate;
  }

  private static getHoursByPriority(priority: TicketPriority): number {
    switch (priority) {
      case "CRITICAL":
        return 4;
      case "HIGH":
        return 24;
      case "MEDIUM":
        return 72;
      case "LOW":
        return 168;
      default:
        return 72; // Fallback to MEDIUM
    }
  }

  /**
   * Verifica se o SLA foi violado.
   */
  static isSlaBreached(slaTargetDate: Date | null, completedAt: Date = new Date()): boolean {
    if (!slaTargetDate) {
      return false; // Sem SLA configurado, não há violação
    }
    return completedAt.getTime() > slaTargetDate.getTime();
  }
}
