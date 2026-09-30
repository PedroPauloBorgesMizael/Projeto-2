import { Request, Response } from "express";
import {
  ListApprovalTypeService,
  CreateApprovalTypeService,
  UpdateApprovalTypeService,
  DeleteApprovalTypeService,
  SeedApprovalTypesService,
} from "../services/ApprovalTypeService";

export class ApprovalTypeController {
  async list(request: Request, response: Response) {
    const { activeOnly } = request.query;
    const service = new ListApprovalTypeService();
    const result = await service.execute(activeOnly === "true");
    return response.json(result);
  }

  async create(request: Request, response: Response) {
    const { name, description, isActive } = request.body;
    const service = new CreateApprovalTypeService();
    const result = await service.execute({ name, description, isActive });
    return response.status(201).json(result);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, description, isActive } = request.body;
    const service = new UpdateApprovalTypeService();
    const result = await service.execute(id, { name, description, isActive });
    return response.json(result);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;
    const service = new DeleteApprovalTypeService();
    const result = await service.execute(id);
    return response.json(result);
  }

  async seed(request: Request, response: Response) {
    const service = new SeedApprovalTypesService();
    await service.execute();
    return response.status(204).send();
  }
}
