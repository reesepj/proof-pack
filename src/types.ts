export type PacketStatus = "draft" | "ready" | "sent" | "archived";

export type PacketType =
  | "Client Ops"
  | "Security Fix"
  | "Marketing Proof"
  | "Personal System"
  | "Product Work";

export type Severity = "low" | "medium" | "high";

export interface ProofPacket {
  id: string;
  title: string;
  client: string;
  owner: string;
  type: PacketType;
  status: PacketStatus;
  date: string;
  tags: string[];
  problem: string;
  work: string;
  evidence: string[];
  impact: string;
  risks: string[];
  nextAsk: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityFinding {
  field: string;
  severity: Severity;
  message: string;
}

export interface QualityAudit {
  score: number;
  findings: QualityFinding[];
}

export interface ProofStore {
  version: 1;
  packets: ProofPacket[];
}
