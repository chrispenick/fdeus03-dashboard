"use client";
import { useState } from "react";
import { VERDICT_LABEL, type Verdict } from "@/lib/types";

type T = { id: number; number: number; name: string; project: string };
type R = { team_id: number; verdict: Verdict; notes: string };

export default function JudgeForm({ token, teams, initial }: { token: string; teams: T[]; initial: R[] }) {
  const [v, setV] = useState<Record<number, string>>(Object.fromEntries(initial.map((r) => [r.team_id, r.verdict])));
  const [n, setN] = useState<Record<number, string>>(Object.fromEntries(initial.map((r) => [r.team_id, r.notes])));
  const [msg, setMsg] = useState<Record<number, { ok: boolean; t: string }>>({});
  async function save(t: T) {
    const r = await fetch(`/api/judge/${token}`, { method: "PUT", body: JSON.stringify({ team_id: t.id, verdict: v[t.id] ?? "", notes: n[t.id] ?? "" }) });
    const j = await r.json().catch(() => ({}));
    setMsg((m) => ({ ...m, [t.id]: { ok: r.ok, t: r.ok ? "Saved" : j.error ?? "Failed" } }));
  }
  return (
    <>
      {teams.map((t) => (
        <div className="panel" key={t.id}>
          <h3 style={{ margin: 0 }}>Team {t.number} — {t.name}</h3>
          <p className="proj">{t.project || "Project TBD"}</p>
          <div className="row">
            {(Object.keys(VERDICT_LABEL) as Verdict[]).map((k) => (
              <label key={k} style={{ minWidth: 0 }}>
                <input type="radio" name={`v${t.id}`} checked={v[t.id] === k} onChange={() => setV((s) => ({ ...s, [t.id]: k }))} /> {VERDICT_LABEL[k]}
              </label>
            ))}
          </div>
          <textarea placeholder="Notes (private to organizers) — e.g. strong candidate, place on a project ASAP"
            value={n[t.id] ?? ""} onChange={(e) => setN((s) => ({ ...s, [t.id]: e.target.value }))} />
          <div className="row"><button className="primary" onClick={() => save(t)}>Save</button>
            {msg[t.id] && <span className={msg[t.id].ok ? "msg" : "err"}>{msg[t.id].t}</span>}</div>
        </div>
      ))}
    </>
  );
}
