import { pool, query } from "@/lib/db";

const VERDICTS = ["pass", "pass_notes", "not_pass"];

export async function PUT(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [judge] = await query("SELECT id FROM judges WHERE token=$1", [token]);
  if (!judge) return Response.json({ error: "invalid link" }, { status: 404 });
  const { team_id, verdict, notes } = await req.json();
  const [team] = await query("SELECT id FROM teams WHERE id=$1", [team_id]);
  if (!team) return Response.json({ error: "unknown team" }, { status: 400 });
  if (!verdict) {
    await pool.query("DELETE FROM reviews WHERE team_id=$1 AND judge_id=$2", [team_id, judge.id]);
    return Response.json({ ok: true });
  }
  if (!VERDICTS.includes(verdict)) return Response.json({ error: "bad verdict" }, { status: 400 });
  await pool.query(
    `INSERT INTO reviews (team_id, judge_id, verdict, notes) VALUES ($1,$2,$3,$4)
     ON CONFLICT (team_id, judge_id) DO UPDATE SET verdict=EXCLUDED.verdict, notes=EXCLUDED.notes`,
    [team_id, judge.id, verdict, String(notes ?? "")]
  );
  return Response.json({ ok: true });
}
