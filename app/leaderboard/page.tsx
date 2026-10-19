import Link from "next/link";
import { getResults, scoresRevealed } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Results() {
  if (!(await scoresRevealed()))
    return (
      <>
        <h1>Results</h1>
        <div className="empty">Results are hidden until the organizers reveal them.</div>
      </>
    );
  const results = await getResults();
  return (
    <>
      <h1>Results</h1>
      <p className="sub">Judge verdicts per team.</p>
      <table>
        <thead><tr><th>Team</th><th>Project</th><th>Pass</th><th>Pass w/ notes</th><th>Not pass</th></tr></thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.team.id}>
              <td><Link href={`/teams/${r.team.id}`}>{r.team.name}</Link></td>
              <td>{r.team.project_name || <em>TBD</em>}</td>
              <td>{r.pass}</td><td>{r.pass_notes}</td><td>{r.not_pass}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
