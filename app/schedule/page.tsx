import Link from "next/link";
import { Fragment } from "react";
import { BREAK_AFTER } from "@/lib/schedule";
import { getScheduleSettings, getTeams } from "@/lib/data";
import { StatusBadge } from "@/components/TeamDetail";

export const dynamic = "force-dynamic";

export default async function Schedule() {
  const teams = (await getTeams()).sort((a, b) => (a.slot_order ?? 1e9) - (b.slot_order ?? 1e9) || a.number - b.number);
  const { breakMin, breakTime } = await getScheduleSettings();
  return (
    <>
      <h1>Presentation Schedule</h1>
      <p className="sub">Order and time slots are set by the organizers.</p>
      <table>
        <thead><tr><th>#</th><th>Time</th><th>Team</th><th>Project</th><th>Room</th><th>Status</th></tr></thead>
        <tbody>
          {teams.map((t, i) => (
            <Fragment key={t.id}>
            {i === BREAK_AFTER && breakMin > 0 && breakTime && (
              <tr><td></td><td>{breakTime}</td><td colSpan={4}><em>Break ({breakMin} min)</em></td></tr>
            )}
            <tr>
              <td>{t.slot_order ?? "–"}</td>
              <td>{t.slot_time || "TBD"}</td>
              <td><Link href={`/teams/${t.id}`}>{t.name}</Link></td>
              <td>{t.project_name || <em>TBD</em>}</td>
              <td>{t.room || "–"}</td>
              <td><StatusBadge status={t.status} /></td>
            </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}
