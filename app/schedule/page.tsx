import Link from "next/link";
import { Fragment } from "react";
import { BREAK_AFTER, STATE_LABEL, presentationState } from "@/lib/schedule";
import { getScheduleSettings, getTeams } from "@/lib/data";
import { StatusBadge } from "@/components/TeamDetail";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function Schedule() {
  const teams = (await getTeams()).sort((a, b) => (a.slot_order ?? 1e9) - (b.slot_order ?? 1e9) || a.number - b.number);
  const { breakMin, breakTime, currentSlot } = await getScheduleSettings();
  const stateOf = (t: (typeof teams)[number]) => presentationState(t.slot_order, currentSlot);
  const now = teams.find((t) => stateOf(t) === "now");
  const next = teams.find((t) => stateOf(t) === "next");
  const allDone = currentSlot > 0 && !now && !next;
  return (
    <>
      <AutoRefresh />
      <h1>Presentation Schedule</h1>
      <p className="sub">Order and time slots are set by the organizers.</p>
      {currentSlot > 0 || next ? (
        <p className="panel" style={{ fontWeight: 700 }}>
          {allDone ? "All presentations complete" : <>Now: {now?.name ?? "–"} · Next: {next?.name ?? "–"}</>}
        </p>
      ) : null}
      <table>
        <thead><tr><th>#</th><th>Time</th><th>Team</th><th>Project</th><th>Room</th><th>Status</th><th>Presentation</th></tr></thead>
        <tbody>
          {teams.map((t, i) => (
            <Fragment key={t.id}>
            {i === BREAK_AFTER && breakMin > 0 && breakTime && (
              <tr><td></td><td>{breakTime}</td><td colSpan={5}><em>Break ({breakMin} min)</em></td></tr>
            )}
            <tr className={`row-${stateOf(t)}`}>
              <td>{t.slot_order ?? "–"}</td>
              <td>{t.slot_time || "TBD"}</td>
              <td><Link href={`/teams/${t.id}`}>{t.name}</Link></td>
              <td>{t.project_name || <em>TBD</em>}</td>
              <td>{t.room || "–"}</td>
              <td><StatusBadge status={t.status} /></td>
              <td>{stateOf(t) !== "upcoming" && <span className={`badge p-${stateOf(t)}`}>{STATE_LABEL[stateOf(t)]}</span>}</td>
            </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}
