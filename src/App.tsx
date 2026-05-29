import { useEffect, useMemo, useRef, useState } from "react";
import type { ProofPacket, ProofStore } from "./types";
import {
  completionScore,
  filename,
  formatLines,
  fromTemplate,
  parseLines,
  qualityAudit,
  statusOptions,
  templates,
  toMarkdown,
  touch,
  type TemplateKey,
  typeOptions
} from "./lib/proof";
import { exportStore, loadStore, saveStore } from "./lib/storage";

const templateKeys = Object.keys(templates) as TemplateKey[];

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function text(value: string) {
  return value.trim().toLowerCase();
}

function packetMatches(packet: ProofPacket, query: string) {
  const needle = text(query);
  if (!needle) return true;
  return [
    packet.title,
    packet.client,
    packet.owner,
    packet.type,
    packet.status,
    packet.problem,
    packet.work,
    packet.impact,
    packet.nextAsk,
    ...packet.tags,
    ...packet.evidence,
    ...packet.risks
  ].some((value) => text(value).includes(needle));
}

export function App() {
  const [store, setStore] = useState<ProofStore>(() => loadStore());
  const [active, setActive] = useState<ProofPacket>(() => fromTemplate("client-ops"));
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("client-ops");
  const [notice, setNotice] = useState("");
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const packets = useMemo(
    () => [...store.packets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [store.packets]
  );

  const filtered = useMemo(() => packets.filter((packet) => packetMatches(packet, query)), [packets, query]);
  const audit = useMemo(() => qualityAudit(active), [active]);
  const completion = useMemo(() => completionScore(active), [active]);
  const markdown = useMemo(() => toMarkdown(active), [active]);
  const ready = store.packets.filter((packet) => packet.status === "ready" || packet.status === "sent").length;

  const update = <K extends keyof ProofPacket>(key: K, value: ProofPacket[K]) => {
    setActive((packet) => touch({ ...packet, [key]: value }));
  };

  const selectPacket = (packet: ProofPacket) => {
    setSelected(packet.id);
    setActive(packet);
  };

  const newPacket = (key: TemplateKey = template) => {
    const packet = fromTemplate(key);
    setSelected(null);
    setActive(packet);
    setNotice("New packet loaded");
  };

  const savePacket = () => {
    const packet = touch(active);
    setStore((current) => {
      const exists = current.packets.some((item) => item.id === packet.id);
      return {
        version: 1,
        packets: exists
          ? current.packets.map((item) => (item.id === packet.id ? packet : item))
          : [packet, ...current.packets]
      };
    });
    setSelected(packet.id);
    setActive(packet);
    setNotice("Packet saved");
  };

  const duplicate = () => {
    const packet = touch({ ...active, id: crypto.randomUUID ? `proof_${crypto.randomUUID()}` : `proof_${Date.now()}`, title: `${active.title} copy`, status: "draft" });
    setSelected(null);
    setActive(packet);
    setNotice("Packet duplicated");
  };

  const remove = () => {
    if (!selected) return;
    if (!window.confirm("Delete this proof packet from local storage?")) return;
    setStore((current) => ({ version: 1, packets: current.packets.filter((packet) => packet.id !== selected) }));
    setSelected(null);
    setActive(fromTemplate("client-ops"));
    setNotice("Packet deleted");
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setNotice("Markdown copied");
  };

  const importFile = async (input: File) => {
    const raw = await input.text();
    const parsed = JSON.parse(raw) as unknown;
    const imported = loadImported(parsed);
    setStore((current) => ({ version: 1, packets: mergePackets(current.packets, imported) }));
    setNotice(`Imported ${imported.length} packet${imported.length === 1 ? "" : "s"}`);
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Proof Pack</p>
          <h1>Proof beats memory.</h1>
        </div>
        <p className="lead">
          A local-first workspace for turning shipped work, client ops, hardening, and marketing output into evidence someone can review, trust, and act on.
        </p>
      </section>

      <section className="workspace">
        <aside className="sidebar panel">
          <div className="stats">
            <div><strong>{store.packets.length}</strong><span>packets</span></div>
            <div><strong>{ready}</strong><span>ready or sent</span></div>
            <div><strong>{audit.score}</strong><span>quality</span></div>
          </div>

          <label className="field compact">
            <span>Search proof</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="client, tag, status" />
          </label>

          <div className="templateRow">
            <select value={template} onChange={(event) => setTemplate(event.target.value as TemplateKey)}>
              {templateKeys.map((key) => <option value={key} key={key}>{templates[key].label}</option>)}
            </select>
            <button className="btn" onClick={() => newPacket()}>New</button>
          </div>

          <div className="list" aria-label="Saved proof packets">
            {filtered.length ? filtered.map((packet) => (
              <button className={`packet ${packet.id === selected ? "active" : ""}`} key={packet.id} onClick={() => selectPacket(packet)}>
                <strong>{packet.title}</strong>
                <span>{packet.client || "No client"} / {completionScore(packet)}% / {packet.status}</span>
              </button>
            )) : <div className="empty">No matching packets. Save one or loosen the search.</div>}
          </div>

          <div className="importExport">
            <input ref={file} type="file" accept="application/json" hidden onChange={(event) => {
              const input = event.target.files?.[0];
              if (!input) return;
              void importFile(input).catch(() => setNotice("Import failed"));
              event.target.value = "";
            }} />
            <button className="btn subtle" onClick={() => file.current?.click()}>Import JSON</button>
            <button className="btn subtle" onClick={() => download("proof-pack-export.json", exportStore(store), "application/json")}>Export all</button>
          </div>
        </aside>

        <section className="editor panel">
          <div className="toolbar">
            <div>
              <p className="kicker">Editing</p>
              <h2>{active.title || "Untitled proof packet"}</h2>
            </div>
            <div className="actions">
              <button className="btn primary" onClick={savePacket}>Save</button>
              <button className="btn" onClick={duplicate}>Duplicate</button>
              <button className="btn danger" onClick={remove} disabled={!selected}>Delete</button>
            </div>
          </div>

          <div className="formGrid">
            <label className="field wide"><span>Title</span><input value={active.title} onChange={(event) => update("title", event.target.value)} /></label>
            <label className="field"><span>Client or project</span><input value={active.client} onChange={(event) => update("client", event.target.value)} /></label>
            <label className="field"><span>Owner</span><input value={active.owner} onChange={(event) => update("owner", event.target.value)} /></label>
            <label className="field"><span>Type</span><select value={active.type} onChange={(event) => update("type", event.target.value as ProofPacket["type"])}>{typeOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="field"><span>Status</span><select value={active.status} onChange={(event) => update("status", event.target.value as ProofPacket["status"])}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="field"><span>Date</span><input type="date" value={active.date} onChange={(event) => update("date", event.target.value)} /></label>
            <label className="field"><span>Tags</span><input value={active.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder="client, proof, ops" /></label>
            <label className="field wide"><span>Problem</span><textarea value={active.problem} onChange={(event) => update("problem", event.target.value)} /></label>
            <label className="field wide"><span>Work performed</span><textarea value={active.work} onChange={(event) => update("work", event.target.value)} /></label>
            <label className="field wide"><span>Evidence</span><textarea value={formatLines(active.evidence)} onChange={(event) => update("evidence", parseLines(event.target.value))} placeholder="One artifact, URL, command, metric, or file per line" /></label>
            <label className="field wide"><span>Impact</span><textarea value={active.impact} onChange={(event) => update("impact", event.target.value)} /></label>
            <label className="field wide"><span>Risks</span><textarea value={formatLines(active.risks)} onChange={(event) => update("risks", parseLines(event.target.value))} /></label>
            <label className="field wide"><span>Next ask</span><textarea value={active.nextAsk} onChange={(event) => update("nextAsk", event.target.value)} /></label>
          </div>
        </section>

        <aside className="review panel">
          <div className="scoreRing" style={{ background: `conic-gradient(var(--accent) ${completion}%, var(--panel-3) 0)` }}>
            <div>{completion}%<span>complete</span></div>
          </div>

          <section>
            <h3>Quality audit</h3>
            {audit.findings.length ? (
              <ul className="findings">
                {audit.findings.map((item) => <li key={`${item.field}-${item.message}`} data-severity={item.severity}>{item.message}</li>)}
              </ul>
            ) : <p className="ok">This packet is ready to send.</p>}
          </section>

          <section>
            <div className="previewTop">
              <h3>Markdown brief</h3>
              <div className="actions tight">
                <button className="btn" onClick={copyMarkdown}>Copy</button>
                <button className="btn" onClick={() => download(filename(active, "md"), markdown, "text/markdown")}>MD</button>
                <button className="btn" onClick={() => download(filename(active, "json"), JSON.stringify(active, null, 2), "application/json")}>JSON</button>
              </div>
            </div>
            <pre>{markdown}</pre>
          </section>
        </aside>
      </section>

      <div className={`toast ${notice ? "show" : ""}`}>{notice}</div>
    </main>
  );
}

function mergePackets(current: ProofPacket[], imported: ProofPacket[]) {
  const map = new Map(current.map((packet) => [packet.id, packet]));
  imported.forEach((packet) => map.set(packet.id, packet));
  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function loadImported(value: unknown): ProofPacket[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const list = Array.isArray(record.packets) ? record.packets : [value];
  return list.map((item) => {
    const packet = item as Partial<ProofPacket>;
    return touch({
      id: typeof packet.id === "string" ? packet.id : `proof_${crypto.randomUUID()}`,
      title: packet.title || "Imported proof packet",
      client: packet.client || "",
      owner: packet.owner || "Reese + Vespera",
      type: packet.type || "Client Ops",
      status: packet.status || "draft",
      date: packet.date || new Date().toISOString().slice(0, 10),
      tags: Array.isArray(packet.tags) ? packet.tags : [],
      problem: packet.problem || "",
      work: packet.work || "",
      evidence: Array.isArray(packet.evidence) ? packet.evidence : [],
      impact: packet.impact || "",
      risks: Array.isArray(packet.risks) ? packet.risks : [],
      nextAsk: packet.nextAsk || "",
      createdAt: packet.createdAt || new Date().toISOString(),
      updatedAt: packet.updatedAt || new Date().toISOString()
    });
  });
}
