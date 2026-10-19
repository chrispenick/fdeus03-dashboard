import Link from "next/link";
import { getTeams } from "@/lib/data";
import { StatusBadge } from "@/components/TeamDetail";

export const dynamic = "force-dynamic";

export default async function Schedule() {
  const teams = (await getTeams()).sort((a, b) => (a.slot_order ?? 1e9) - (b.slot_order ?? 1e9) || a.number - b.number);
  return (
    <>
      <h1>Presentation Schedule</h1>
      <p className="sub">Order and time slots are set by the organizers.</p>
      <table>
        <thead><tr><th>#</th><th>Time</th><th>Team</th><th>Project</th><th>Room</th><th>Status</th></tr></thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id}>
              <td>{t.slot_order ?? "–"}</td>
              <td>{t.slot_time || "TBD"}</td>
              <td><Link href={`/teams/${t.id}`}>{t.name}</Link></td>
              <td>{t.project_name || <em>TBD</em>}</td>
              <td>{t.room || "–"}</td>
              <td><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
