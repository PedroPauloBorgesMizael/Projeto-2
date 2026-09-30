export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ApprovalTypeItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    approvals: number;
  };
}

export interface ApprovalItem {
  id: string;
  ticketId: string;
  approvalTypeId: string;
  requestedById: string;
  approverUserId?: string | null;
  approverTeamId?: string | null;
  status: ApprovalStatus;
  notes?: string | null;
  decisionNotes?: string | null;
  decidedAt?: string | null;
  decidedById?: string | null;
  createdAt: string;
  updatedAt?: string;
  approvalType?: {
    id: string;
    name: string;
    description?: string | null;
  };
  requestedBy?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  approverUser?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  approverTeam?: {
    id: string;
    name: string;
  } | null;
  decidedBy?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
}

export interface CreateApprovalTypePayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateApprovalTypePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateApprovalPayload {
  ticketId: string;
  approvalTypeId: string;
  approverUserId?: string;
  approverTeamId?: string;
  notes?: string;
}

export interface DecideApprovalPayload {
  decision: 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
}
