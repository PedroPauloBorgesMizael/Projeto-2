import { api } from './api';
import type {
  ApprovalTypeItem,
  ApprovalItem,
  CreateApprovalTypePayload,
  UpdateApprovalTypePayload,
  CreateApprovalPayload,
  DecideApprovalPayload,
} from '../interface/approval';

export const approvalService = {
  // Tipos de Aprovação
  async listApprovalTypes(activeOnly: boolean = false): Promise<ApprovalTypeItem[]> {
    const response = await api.get<ApprovalTypeItem[]>('/approval-types', {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
    return response.data;
  },

  async createApprovalType(payload: CreateApprovalTypePayload): Promise<ApprovalTypeItem> {
    const response = await api.post<ApprovalTypeItem>('/approval-types', payload);
    return response.data;
  },

  async updateApprovalType(id: string, payload: UpdateApprovalTypePayload): Promise<ApprovalTypeItem> {
    const response = await api.put<ApprovalTypeItem>(`/approval-types/${id}`, payload);
    return response.data;
  },

  async deleteApprovalType(id: string): Promise<void> {
    await api.delete(`/approval-types/${id}`);
  },

  async seedDefaultTypes(): Promise<void> {
    await api.post('/approval-types/seed');
  },

  // Aprovações em Chamados
  async listTicketApprovals(ticketId: string): Promise<ApprovalItem[]> {
    const response = await api.get<ApprovalItem[]>(`/approvals/ticket/${ticketId}`);
    return response.data;
  },

  async requestApproval(payload: CreateApprovalPayload): Promise<ApprovalItem> {
    const response = await api.post<ApprovalItem>('/approvals', payload);
    return response.data;
  },

  async decideApproval(id: string, payload: DecideApprovalPayload): Promise<ApprovalItem> {
    const response = await api.patch<ApprovalItem>(`/approvals/${id}/decide`, payload);
    return response.data;
  },

  async cancelApproval(id: string): Promise<ApprovalItem> {
    const response = await api.patch<ApprovalItem>(`/approvals/${id}/cancel`);
    return response.data;
  },
};
