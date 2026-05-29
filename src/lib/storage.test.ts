import { describe, expect, it, beforeEach } from "vitest";
import { createPacket } from "./proof";
import { exportStore, loadStore, normalizeStore, saveStore } from "./storage";

describe("versioned local storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty versioned store when nothing exists", () => {
    expect(loadStore()).toEqual({ version: 1, packets: [] });
  });

  it("round-trips packets through localStorage", () => {
    const packet = createPacket({ client: "Acropolis Ops", title: "Ops proof" });

    saveStore({ version: 1, packets: [packet] });

    expect(loadStore().packets[0]?.client).toBe("Acropolis Ops");
  });

  it("quarantines corrupt storage instead of throwing", () => {
    localStorage.setItem("proof-pack:v1", "{not json");

    expect(loadStore()).toEqual({ version: 1, packets: [] });
    expect(localStorage.getItem("proof-pack:v1:corrupt")).toBeTruthy();
  });

  it("exports deterministic JSON", () => {
    const packet = createPacket({ client: "Acropolis Ops", title: "Ops proof" });
    const json = exportStore({ version: 1, packets: [packet] });

    expect(json).toContain('"version": 1');
    expect(json).toContain('"client": "Acropolis Ops"');
  });

  it("rejects empty and malformed imported packet objects", () => {
    const normalized = normalizeStore({ packets: [{}, { title: { nested: true }, evidence: ["valid", 12] }] });

    expect(normalized.packets).toHaveLength(1);
    expect(normalized.packets[0]?.title).toBe("Untitled proof packet");
    expect(normalized.packets[0]?.evidence).toEqual(["valid"]);
  });
});
