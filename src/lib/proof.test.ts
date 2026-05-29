import { describe, expect, it } from "vitest";
import { createPacket, completionScore, qualityAudit, toMarkdown, fromTemplate, parseLines } from "./proof";

describe("proof packet model", () => {
  it("creates a packet with stable defaults", () => {
    const packet = createPacket({ client: "Acropolis Ops", title: "May proof review" });

    expect(packet.id).toMatch(/^proof_/);
    expect(packet.client).toBe("Acropolis Ops");
    expect(packet.title).toBe("May proof review");
    expect(packet.status).toBe("draft");
    expect(packet.evidence).toEqual([]);
  });

  it("builds high quality template packets with required sections", () => {
    const packet = fromTemplate("client-ops");

    expect(packet.type).toBe("Client Ops");
    expect(packet.problem.length).toBeGreaterThan(10);
    expect(packet.nextAsk.length).toBeGreaterThan(10);
  });

  it("scores completion from required proof fields", () => {
    const empty = createPacket();
    const strong = createPacket({
      client: "Transcend Outdoors",
      title: "Social proof packet",
      problem: "Client-visible work was spread across messages and folders.",
      work: "Collected assets, wrote the proof brief, and prepared approval copy.",
      evidence: ["Watermarked finals", "Approval draft", "Source folder"],
      impact: "Reduced client review friction and created reusable marketing assets.",
      nextAsk: "Approve the packet for social and GBP reuse."
    });

    expect(completionScore(empty)).toBeLessThan(20);
    expect(completionScore(strong)).toBe(100);
  });

  it("audits weak packets with actionable findings", () => {
    const packet = createPacket({ client: "A", title: "Thin" });
    const audit = qualityAudit(packet);

    expect(audit.score).toBeLessThan(50);
    expect(audit.findings.map((f) => f.field)).toContain("problem");
    expect(audit.findings.map((f) => f.severity)).toContain("high");
  });

  it("exports clean markdown without undefined values", () => {
    const packet = createPacket({
      client: "Transcend Outdoors",
      title: "May social proof",
      owner: "Reese + Vespera",
      date: "2026-05-29",
      problem: "Proof was scattered.",
      work: "Structured the proof packet.",
      evidence: ["before.png", "after.png"],
      impact: "Less client review friction.",
      nextAsk: "Approve reuse."
    });

    const md = toMarkdown(packet);

    expect(md).toContain("# May social proof");
    expect(md).toContain("- before.png");
    expect(md).not.toContain("undefined");
    expect(md).not.toContain("—");
  });

  it("parses pasted evidence lines safely", () => {
    expect(parseLines("- one\n\n* two\n3. three")).toEqual(["one", "two", "three"]);
  });
});
