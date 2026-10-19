"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VERDICT_LABEL, type Team } from "@/lib/types";
import type { Review } from "@/lib/data";

type Judge = { id: number; name: string; token: string };
const KINDS = ["repo", "demo", "slides", "chat"] as const;

async function call(method: string, url: string, body?: unknown) {
  const r = await fetch(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return r.ok ? null : (j.error ?? "Request failed");
}

export default function AdminPanel(p: { teams: Team[]; reviews: Review[]; judges: Judge[]; revealed: boolean }) {
  const [tab, setTab] = useState("teams");
  const router = useRouter();
  return (
    <>
      <div className="row">
        <h1 style={{ flex: 1 }}>Admin</h1>
        <button onClick={async () => { await call("POST", "/api/admin/logout"); router.refresh(); }}>Sign out</button>
      </div>
      <div className="tabs" role="tablist">
        {["teams", "schedule", "judges", "results"].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {tab === "teams" && <TeamsTab teams={p.teams} />}
            {tab === "schedule" && <ScheduleTab teams={p.teams} />}
      {tab === "judges" && <JudgesTab judges={p.judges} />}
      {tab === "results" && <ResultsTab reviews={p.reviews} teams={p.teams} revealed={p.revealed} />}
    </>
  );
}

function TeamsTab({ teams }: { teams: Team[] }) {
  const [id, setId] = useState(teams[0]?.id);
  const team = teams.find((t) => t.id === id)!;
  return (
    <>
      <div className="row">
        <select value={id} onChange={(e) => setId(Number(e.target.value))}>
          {teams.map((t) => <option key={t.id} value={t.id}>Team {t.number} – {t.name}</option>)}
        </select>
      </div>
      <TeamForm key={team.id + JSON.stringify(team)} team={team} />
    </>
  );
}

function TeamForm({ team }: { team: Team }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: team.name, project_name: team.project_name, description: team.description, status: team.status,
    tags: team.tags.join(", "), slot_order: team.slot_order?.toString() ?? "", slot_time: team.slot_time, room: team.room,
    members: team.members.map((m) => m.name).join("\n"),
    links: KINDS.map((k) => ({ kind: k, url: team.links.find((l) => l.kind === k)?.url ?? "" })),
  });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  async function save() {
    const err = await call("PUT", `/api/teams/${team.id}`, {
      ...f, tags: f.tags.split(","), members: f.members.split("\n"),
    });
    setMsg({ ok: !err, t: err ?? "Saved" });
    if (!err) router.refresh();
  }
  return (
    <div className="panel">
      <div className="row"><label>Team name</label><input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="row"><label>Project name</label><input value={f.project_name} onChange={(e) => set("project_name", e.target.value)} /></div>
      <div className="row"><label>Room</label><input value={f.room} placeholder="Where the team is working" onChange={(e) => set("room", e.target.value)} /></div>
      <div className="row"><label>Status</label>
        <select value={f.status} onChange={(e) => set("status", e.target.value)}>
          <option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="demo_ready">Demo-ready</option>
        </select>
      </div>
      <div className="row"><label>Description</label></div>
      <textarea value={f.description} onChange={(e) => set("description", e.target.value)} />
      <div className="row"><label>Tags</label><input value={f.tags} placeholder="comma, separated" onChange={(e) => set("tags", e.target.value)} /></div>
      <div className="row"><label>Presentation #</label><input type="number" style={{ width: 80 }} value={f.slot_order} onChange={(e) => set("slot_order", e.target.value)} />
        <label style={{ minWidth: 0 }}>Time</label><input value={f.slot_time} placeholder="e.g. Nov 6, 10:30 AM" onChange={(e) => set("slot_time", e.target.value)} /></div>
      {f.links.map((l, i) => (
        <div className="row" key={l.kind}><label>{l.kind}</label>
          <input style={{ flex: 1 }} value={l.url} placeholder="https://…" onChange={(e) => set("links", f.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} /></div>
      ))}
      <div className="row"><label>Members (one per line)</label></div>
      <textarea value={f.members} onChange={(e) => set("members", e.target.value)} />
      <div className="row"><button className="primary" onClick={save}>Save team</button>{msg && <span className={msg.ok ? "msg" : "err"}>{msg.t}</span>}</div>
    </div>
  );
}

function JudgesTab({ judges }: { judges: Judge[] }) {
  const router = useRouter();
  const [n, setN] = useState(""), [err, setErr] = useState("");
  const origin = typeof window === "undefined" ? "" : location.origin;
  return (
    <div className="panel">
      {judges.length === 0 && <div className="empty" style={{ marginBottom: 12 }}>No judges yet.</div>}
      {judges.map((j) => (
        <div className="row" key={j.id}>
          <strong style={{ minWidth: 140 }}>{j.name}</strong>
          <input readOnly style={{ flex: 1 }} value={`${origin}/judge/${j.token}`} onFocus={(e) => e.target.select()} />
          <button onClick={() => navigator.clipboard.writeText(`${origin}/judge/${j.token}`)}>Copy</button>
          <button className="danger" onClick={async () => { if (confirm(`Remove ${j.name} and their scores?`)) { await call("DELETE", `/api/judges/${j.id}`); router.refresh(); } }}>Remove</button>
        </div>
      ))}
      <h4>Add judge</h4>
      <div className="row">
        <input placeholder="Judge name" value={n} onChange={(e) => setN(e.target.value)} />
        <button className="primary" onClick={async () => { const e = await call("POST", "/api/judges", { name: n }); setErr(e ?? ""); if (!e) { setN(""); router.refresh(); } }}>Add</button>
        {err && <span className="err">{err}</span>}
      </div>
    </div>
  );
}

function ResultsTab({ reviews, teams, revealed }: { reviews: Review[]; teams: Team[]; revealed: boolean }) {
  const router = useRouter();
  return (
    <>
      <div className="panel">
        <p>Verdict tallies are currently <strong>{revealed ? "visible" : "hidden"}</strong> on the public Results page. Notes are never public.</p>
        <button className="primary" onClick={async () => { await call("PUT", "/api/settings", { scores_revealed: !revealed }); router.refresh(); }}>
          {revealed ? "Hide results" : "Reveal results"}
        </button>
      </div>
      {reviews.length === 0 && <div className="empty">No reviews submitted yet.</div>}
      {teams.map((t) => {
        const mine = reviews.filter((r) => r.team_id === t.id);
        if (!mine.length) return null;
        return (
          <div className="panel" key={t.id}>
            <h3 style={{ margin: 0 }}>Team {t.number} — {t.name}</h3>
            {mine.map((r) => (
              <p key={r.judge_id}><strong>{r.judge}:</strong> {VERDICT_LABEL[r.verdict]}{r.notes && <> — {r.notes}</>}</p>
            ))}
          </div>
        );
      })}
    </>
  );
}

function ScheduleTab({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const sorted = [...teams].sort((a, b) => (a.slot_order ?? 1e9) - (b.slot_order ?? 1e9) || a.number - b.number);
  const [items, setItems] = useState(sorted.map((t) => ({ id: t.id, label: `Team ${t.number} – ${t.name}`, time: t.slot_time })));
  const [drag, setDrag] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  function drop(to: number) {
    if (drag === null || drag === to) return;
    setItems((cur) => {
      const next = [...cur];
      const [m] = next.splice(drag, 1);
      next.splice(to, 0, m);
      return next;
    });
    setDrag(null);
  }
  async function save() {
    const err = await call("PUT", "/api/schedule", { order: items.map((i) => ({ id: i.id, time: i.time })) });
    setMsg({ ok: !err, t: err ?? "Saved" });
    if (!err) router.refresh();
  }
  return (
    <div className="panel">
      <p className="sub">Drag rows to set the presentation order, set a time for each, then save.</p>
      {items.map((it, i) => (
        <div
          key={it.id}
          className="row"
          draggable
          onDragStart={() => setDrag(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop(i)}
          onDragEnd={() => setDrag(null)}
          style={{ padding: 8, border: "1px solid var(--border)", borderRadius: 8, cursor: "grab", opacity: drag === i ? 0.4 : 1 }}
        >
          <span aria-hidden>⠿</span>
          <strong style={{ width: 28 }}>{i + 1}</strong>
          <span style={{ flex: 1, minWidth: 180 }}>{it.label}</span>
          <input value={it.time} placeholder="Time, e.g. 10:30 AM"
            onChange={(e) => setItems((cur) => cur.map((x) => (x.id === it.id ? { ...x, time: e.target.value } : x)))} />
        </div>
      ))}
      <div className="row"><button className="primary" onClick={save}>Save schedule</button>{msg && <span className={msg.ok ? "msg" : "err"}>{msg.t}</span>}</div>
    </div>
  );
}
