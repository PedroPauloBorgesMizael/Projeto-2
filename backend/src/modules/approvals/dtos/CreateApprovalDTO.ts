export interface CreateApprovalDTO {
  ticketId: string;
  approvalTypeId: string;
  requestedById: string;
  approverUserId?: string;
  approverTeamId?: string;
  notes?: string;
}
