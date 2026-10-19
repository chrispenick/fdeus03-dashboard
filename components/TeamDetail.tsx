import { STATUS_LABEL, type Team } from "@/lib/types";

export const KIND_LABEL = { repo: "Repository", demo: "Demo", slides: "Slides", chat: "Chat" } as const;

export function StatusBadge({ status }: { status: Team["status"] }) {
  return <span className={`badge s-${status}`}>{STATUS_LABEL[status]}</span>;
}

export default function TeamDetail({ team }: { team: Team }) {
  return (
    <div>
      <div className="num">Team {team.number} · {team.breed}</div>
      <h2 style={{ margin: "4px 0" }}>{team.name}</h2>
      <p className="proj">{team.project_name || "Project TBD"}</p>
      <p><StatusBadge status={team.status} /> {team.slot_time && <span className="sub"> Presents {team.slot_time}</span>}</p>
      {team.room && <p><strong>Room:</strong> {team.room}</p>}
      {team.description && <p>{team.description}</p>}
      <p>{team.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</p>
      <h4>Members ({team.members.length})</h4>
      <ul>{team.members.map((m) => <li key={m.id}>{m.name}</li>)}</ul>
      {team.links.length > 0 && (
        <>
          <h4>Links</h4>
          <ul>
            {team.links.map((l) => (
              <li key={l.id}><a href={l.url} target="_blank" rel="noopener noreferrer">{KIND_LABEL[l.kind]}</a></li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
