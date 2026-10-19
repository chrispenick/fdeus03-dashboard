import { query } from "./db";
import type { Team, Verdict } from "./types";
export * from "./types";

export async function getTeams(): Promise<Team[]> {
  const [teams, members, links] = await Promise.all([
    query("SELECT * FROM teams ORDER BY number"),
    query("SELECT id, team_id, name FROM members ORDER BY id"),
    query("SELECT id, team_id, kind, url FROM links ORDER BY id"),
  ]);
  return teams.map((t) => ({
    ...t,
    members: members.filter((m) => m.team_id === t.id),
    links: links.filter((l) => l.team_id === t.id),
  }));
}

export async function getTeam(id: number) {
  return (await getTeams()).find((t) => t.id === id) ?? null;
}

export async function scoresRevealed() {
  const r = await query("SELECT value FROM settings WHERE key='scores_revealed'");
  return r[0]?.value === "true";
}

export type Review = { team_id: number; judge_id: number; judge: string; verdict: Verdict; notes: string };
export async function getReviews(): Promise<Review[]> {
  return query(
    "SELECT r.team_id, r.judge_id, j.name AS judge, r.verdict, r.notes FROM reviews r JOIN judges j ON j.id=r.judge_id ORDER BY r.team_id, j.id"
  );
}

export type Result = { team: Team; pass: number; pass_notes: number; not_pass: number };
// Public view: verdict tallies only. Notes stay admin-only.
export async function getResults(): Promise<Result[]> {
  const [teams, reviews] = await Promise.all([getTeams(), getReviews()]);
  return teams.map((team) => {
    const mine = reviews.filter((r) => r.team_id === team.id);
    const n = (v: Verdict) => mine.filter((r) => r.verdict === v).length;
    return { team, pass: n("pass"), pass_notes: n("pass_notes"), not_pass: n("not_pass") };
  });
}
