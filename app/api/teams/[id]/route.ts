import { isAdmin, unauthorized } from "@/lib/auth";
import { pool } from "@/lib/db";
import { GRADE_SECTIONS, GRADE_OPTIONS } from "@/lib/types";

const STATUSES = ["not_started", "in_progress", "demo_ready"];
const KINDS = ["repo", "demo", "slides", "chat"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  const id = Number((await params).id);
  const b = await req.json();
  if (!STATUSES.includes(b.status)) return Response.json({ error: "bad status" }, { status: 400 });
  const links = (b.links ?? []).filter((l: any) => l.url?.trim());
  for (const l of links) {
    if (!KINDS.includes(l.kind) || !/^https?:\/\//i.test(l.url.trim()))
      return Response.json({ error: `Link must start with http(s)://: ${l.url}` }, { status: 400 });
  }
  const grades: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.grades ?? {})) {
    if (!GRADE_SECTIONS.some((s) => s.key === k) || (v !== "" && !(v as string in GRADE_OPTIONS)))
      return Response.json({ error: `bad grade: ${k}` }, { status: 400 });
    if (v) grades[k] = v as string;
  }
  const members = (b.members ?? [])
    .map((m: string | { name: string; notes?: string }) =>
      typeof m === "string" ? { name: m.trim(), notes: null } : { name: String(m?.name ?? "").trim(), notes: String(m?.notes ?? "") })
    .filter((m: { name: string }) => m.name);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE teams SET name=$2, project_name=$3, description=$4, status=$5, tags=$6, slot_order=$7, slot_time=$8, room=$9, grades=$10, grade_notes=$11 WHERE id=$1`,
      [id, String(b.name).trim(), b.project_name ?? "", b.description ?? "", b.status,
       (b.tags ?? []).map((t: string) => t.trim()).filter(Boolean),
       b.slot_order === "" || b.slot_order == null ? null : Number(b.slot_order), b.slot_time ?? "", String(b.room ?? "").trim(),
       JSON.stringify(grades), String(b.grade_notes ?? "")]
    );
    const old = await client.query("SELECT name, notes FROM members WHERE team_id=$1", [id]);
    const oldNotes = new Map<string, string>(old.rows.map((r: any) => [r.name, r.notes]));
    await client.query("DELETE FROM members WHERE team_id=$1", [id]);
    for (const m of members)
      await client.query("INSERT INTO members (team_id,name,notes) VALUES ($1,$2,$3)", [id, m.name, m.notes ?? oldNotes.get(m.name) ?? ""]);
    await client.query("DELETE FROM links WHERE team_id=$1", [id]);
    for (const l of links) await client.query("INSERT INTO links (team_id,kind,url) VALUES ($1,$2,$3)", [id, l.kind, l.url.trim()]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    return Response.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
  return Response.json({ ok: true });
}
