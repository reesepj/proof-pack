import type { ProofPacket, ProofStore } from "../types";
import { createPacket } from "./proof";

export const STORE_KEY = "proof-pack:v1";
const CORRUPT_KEY = "proof-pack:v1:corrupt";

const fallback: ProofStore = { version: 1, packets: [] };

function safeStorage(): Storage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function packetFromUnknown(value: unknown): ProofPacket | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return createPacket({
    id: typeof record.id === "string" ? record.id : undefined,
    title: typeof record.title === "string" ? record.title : undefined,
    client: typeof record.client === "string" ? record.client : undefined,
    owner: typeof record.owner === "string" ? record.owner : undefined,
    type: record.type === "Security Fix" || record.type === "Marketing Proof" || record.type === "Personal System" || record.type === "Product Work" ? record.type : "Client Ops",
    status: record.status === "ready" || record.status === "sent" || record.status === "archived" ? record.status : "draft",
    date: typeof record.date === "string" ? record.date : undefined,
    tags: Array.isArray(record.tags) ? record.tags.filter((item): item is string => typeof item === "string") : [],
    problem: typeof record.problem === "string" ? record.problem : undefined,
    work: typeof record.work === "string" ? record.work : undefined,
    evidence: Array.isArray(record.evidence) ? record.evidence.filter((item): item is string => typeof item === "string") : [],
    impact: typeof record.impact === "string" ? record.impact : undefined,
    risks: Array.isArray(record.risks) ? record.risks.filter((item): item is string => typeof item === "string") : [],
    nextAsk: typeof record.nextAsk === "string" ? record.nextAsk : undefined,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined
  });
}

export function normalizeStore(value: unknown): ProofStore {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  const packets = Array.isArray(record.packets)
    ? record.packets.map(packetFromUnknown).filter((item): item is ProofPacket => Boolean(item))
    : [];
  return { version: 1, packets };
}

export function loadStore(storage: Storage | null = safeStorage()): ProofStore {
  if (!storage) return fallback;
  const raw = storage.getItem(STORE_KEY);
  if (!raw) return fallback;
  try {
    return normalizeStore(JSON.parse(raw));
  } catch {
    storage.setItem(CORRUPT_KEY, raw);
    storage.removeItem(STORE_KEY);
    return fallback;
  }
}

export function saveStore(store: ProofStore, storage: Storage | null = safeStorage()): void {
  if (!storage) return;
  storage.setItem(STORE_KEY, exportStore(store));
}

export function exportStore(store: ProofStore): string {
  return JSON.stringify({ version: 1, packets: store.packets }, null, 2);
}
