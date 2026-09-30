export interface DecideApprovalDTO {
  approvalId: string;
  userId: string;
  decision: "APPROVED" | "REJECTED";
  decisionNotes?: string;
}
