import type { PacketStatus, PacketType, ProofPacket, QualityAudit, QualityFinding, Severity } from "../types";

export type TemplateKey = "client-ops" | "security-fix" | "marketing-proof" | "personal-system" | "product-work";

interface Template {
  label: string;
  type: PacketType;
  title: string;
  client: string;
  problem: string;
  work: string;
  evidence: string[];
  impact: string;
  risks: string[];
  nextAsk: string;
  tags: string[];
}

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

const uid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `proof_${crypto.randomUUID()}`;
  return `proof_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const templates: Record<TemplateKey, Template> = {
  "client-ops": {
    label: "Client ops packet",
    type: "Client Ops",
    title: "Client proof packet",
    client: "",
    problem: "Useful work is happening, but the visible proof is scattered across messages, folders, and memory.",
    work: "Collect the artifacts, summarize the work performed, and package a clear approval-ready proof brief.",
    evidence: ["Source folder", "Before and after notes", "Client-visible draft"],
    impact: "The client can review faster, trust the work more easily, and reuse the same proof across channels.",
    risks: ["Missing approval owner", "Unclear asset source"],
    nextAsk: "Approve the packet, then select the first channel for reuse.",
    tags: ["client", "proof", "ops"]
  },
  "security-fix": {
    label: "Security fix packet",
    type: "Security Fix",
    title: "Security hardening proof",
    client: "Internal",
    problem: "A system had avoidable exposure, weak verification, or unclear operational ownership.",
    work: "Inspected the real state, made the smallest safe fix, and verified the protected path.",
    evidence: ["Config diff", "Command output", "Health check"],
    impact: "Reduced attack surface and created a durable audit trail for the next operator.",
    risks: ["Secrets must stay out of chat and commits"],
    nextAsk: "Review the evidence, then decide if this should become a recurring check.",
    tags: ["security", "hardening", "audit"]
  },
  "marketing-proof": {
    label: "Marketing proof packet",
    type: "Marketing Proof",
    title: "Marketing asset proof",
    client: "",
    problem: "Good work exists, but it is not yet turned into usable marketing proof.",
    work: "Convert the source material into a reusable packet for social, local SEO, website, and reporting.",
    evidence: ["Final asset", "Caption draft", "Reuse notes"],
    impact: "One project becomes multiple credible proof assets instead of one buried deliverable.",
    risks: ["Generated media must not be presented as real job proof"],
    nextAsk: "Approve the asset and choose the first publishing surface.",
    tags: ["marketing", "social", "local-seo"]
  },
  "personal-system": {
    label: "Personal system packet",
    type: "Personal System",
    title: "Personal system proof",
    client: "Reese",
    problem: "A recurring part of life or work is relying on attention instead of a reliable system.",
    work: "Turn the process into a visible operating loop with proof, review, and a next action.",
    evidence: ["Checklist", "Calendar marker", "Review note"],
    impact: "Less drift, fewer repeated decisions, and clearer weekly accountability.",
    risks: ["System is too heavy to keep using"],
    nextAsk: "Run it once, then cut any step that did not reduce attention load.",
    tags: ["personal", "system", "weekly-reset"]
  },
  "product-work": {
    label: "Product work packet",
    type: "Product Work",
    title: "Product ship proof",
    client: "Internal",
    problem: "A product slice needs proof that it actually works, not just a claim that code changed.",
    work: "Build the smallest useful slice, test it, document the shipped behavior, and capture the next constraint.",
    evidence: ["Test output", "Build output", "Local URL"],
    impact: "The product has a verified increment that can be demoed, sold, or safely extended.",
    risks: ["Prototype polish may hide missing workflows"],
    nextAsk: "Demo the slice and choose one real user workflow to harden next.",
    tags: ["product", "ship", "verification"]
  }
};

export function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

export function formatLines(lines: string[]): string {
  return lines.join("\n");
}

export function createPacket(input: Partial<ProofPacket> = {}): ProofPacket {
  const stamp = now();
  return {
    id: input.id ?? uid(),
    title: input.title ?? "Untitled proof packet",
    client: input.client ?? "",
    owner: input.owner ?? "Reese + Vespera",
    type: input.type ?? "Client Ops",
    status: input.status ?? "draft",
    date: input.date ?? today(),
    tags: input.tags ?? [],
    problem: input.problem ?? "",
    work: input.work ?? "",
    evidence: input.evidence ?? [],
    impact: input.impact ?? "",
    risks: input.risks ?? [],
    nextAsk: input.nextAsk ?? "",
    createdAt: input.createdAt ?? stamp,
    updatedAt: input.updatedAt ?? stamp
  };
}

export function fromTemplate(key: TemplateKey): ProofPacket {
  const t = templates[key];
  return createPacket({
    title: t.title,
    client: t.client,
    type: t.type,
    tags: [...t.tags],
    problem: t.problem,
    work: t.work,
    evidence: [...t.evidence],
    impact: t.impact,
    risks: [...t.risks],
    nextAsk: t.nextAsk
  });
}

export function touch(packet: ProofPacket): ProofPacket {
  return { ...packet, updatedAt: now() };
}

export function completionScore(packet: ProofPacket): number {
  const checks = [
    clean(packet.client).length > 1,
    clean(packet.title).length > 3,
    clean(packet.problem).length > 10,
    clean(packet.work).length > 10,
    packet.evidence.length > 0,
    clean(packet.impact).length > 10,
    clean(packet.nextAsk).length > 10
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function finding(field: string, severity: Severity, message: string): QualityFinding {
  return { field, severity, message };
}

export function qualityAudit(packet: ProofPacket): QualityAudit {
  const findings: QualityFinding[] = [];
  if (clean(packet.client).length < 2) findings.push(finding("client", "medium", "Name the client, project, or internal owner."));
  if (clean(packet.problem).length < 40) findings.push(finding("problem", "high", "Describe the pain in concrete terms, not a vague theme."));
  if (clean(packet.work).length < 40) findings.push(finding("work", "high", "State exactly what changed or shipped."));
  if (packet.evidence.length === 0) findings.push(finding("evidence", "high", "Add at least one artifact, URL, metric, file, or command output."));
  if (clean(packet.impact).length < 40) findings.push(finding("impact", "high", "Explain what got faster, safer, cleaner, easier, or more sellable."));
  if (clean(packet.nextAsk).length < 20) findings.push(finding("nextAsk", "medium", "Make the next ask specific enough for someone to approve or reject."));
  if (packet.risks.length === 0) findings.push(finding("risks", "low", "Name the main risk or say why there is no material risk."));

  const penalty = findings.reduce((sum, item) => sum + (item.severity === "high" ? 20 : item.severity === "medium" ? 10 : 5), 0);
  return { score: clamp(100 - penalty, 0, 100), findings };
}

function section(title: string, body: string): string {
  return `## ${title}\n${body.trim() || "Not captured"}`;
}

function list(lines: string[]): string {
  if (!lines.length) return "Not captured";
  return lines.map((line) => `- ${line}`).join("\n");
}

export function toMarkdown(packet: ProofPacket): string {
  return [
    `# ${clean(packet.title) || "Proof Packet"}`,
    `Client: ${clean(packet.client) || "Not captured"}`,
    `Date: ${packet.date || "Not captured"}`,
    `Type: ${packet.type}`,
    `Status: ${packet.status}`,
    `Owner: ${clean(packet.owner) || "Not captured"}`,
    `Tags: ${packet.tags.length ? packet.tags.join(", ") : "None"}`,
    section("Problem", packet.problem),
    section("Work performed", packet.work),
    section("Evidence", list(packet.evidence)),
    section("Impact", packet.impact),
    section("Risks", list(packet.risks)),
    section("Next ask", packet.nextAsk)
  ].join("\n\n") + "\n";
}

export function filename(packet: ProofPacket, ext: "md" | "json"): string {
  const base = clean(packet.title || packet.client || "proof-pack")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "proof-pack";
  return `${base}.${ext}`;
}

export const statusOptions: PacketStatus[] = ["draft", "ready", "sent", "archived"];
export const typeOptions: PacketType[] = ["Client Ops", "Security Fix", "Marketing Proof", "Personal System", "Product Work"];
