import { Request, Response } from "express";
import { DashboardMetricsService } from "../services/DashboardMetricsService";

export class MetricsController {
  /**
   * @swagger
   * /metrics/dashboard:
   *   get:
   *     summary: Retornar métricas para dashboard
   *     security:
   *       - bearerAuth: []
   *     tags: [Metrics]
   *     responses:
   *       200:
   *         description: Métricas agregadas de chamados
   */
  async dashboard(request: Request, response: Response) {
    const service = new DashboardMetricsService();
    const result = await service.execute();

    return response.json(result);
  }
}
