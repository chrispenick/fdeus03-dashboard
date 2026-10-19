"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Team } from "@/lib/types";
import TeamDetail, { StatusBadge } from "./TeamDetail";

export default function TeamGrid({ teams }: { teams: Team[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("number");
  const [open, setOpen] = useState<Team | null>(null);

  const allTags = useMemo(() => [...new Set(teams.flatMap((t) => t.tags))].sort(), [teams]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = teams.filter(
      (t) =>
        (!status || t.status === status) &&
        (!tag || t.tags.includes(tag)) &&
        (!n || [t.name, t.room, t.breed, t.project_name, t.description, ...t.tags, ...t.members.map((m) => m.name)].join(" ").toLowerCase().includes(n))
    );
    const key: Record<string, (a: Team, b: Team) => number> = {
      number: (a, b) => a.number - b.number,
      name: (a, b) => a.name.localeCompare(b.name),
      status: (a, b) => b.status.localeCompare(a.status),
      slot: (a, b) => (a.slot_order ?? 1e9) - (b.slot_order ?? 1e9),
    };
    return [...list].sort(key[sort]);
  }, [teams, q, status, tag, sort]);

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder="Search teams, projects, people…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="demo_ready">Demo-ready</option>
        </select>
        {allTags.length > 0 && (
          <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Tag">
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="number">Sort: team #</option>
          <option value="name">Sort: name</option>
          <option value="status">Sort: status</option>
          <option value="slot">Sort: presentation order</option>
        </select>
      </div>
      {shown.length === 0 ? (
        <div className="empty">No teams match.</div>
      ) : (
        <div className="grid">
          {shown.map((t) => (
            <button key={t.id} className="card" onClick={() => setOpen(t)}>
              <div className="num">Team {t.number} · {t.breed}</div>
              <h3>{t.name}</h3>
              <p className="proj">{t.project_name || "Project TBD"}</p>
              <StatusBadge status={t.status} />{t.room && <span className="sub"> · {t.room}</span>}
              <ul className="members">{t.members.map((m) => <li key={m.id}>{m.name}</li>)}</ul>
            </button>
          ))}
        </div>
      )}
      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(null)} />
          <aside className="drawer" role="dialog" aria-label={`${open.name} details`}>
            <button className="close" onClick={() => setOpen(null)}>✕ Close</button>
            <TeamDetail team={open} />
            <p><Link href={`/teams/${open.id}`}>Permalink</Link></p>
          </aside>
        </>
      )}
    </>
  );
}
