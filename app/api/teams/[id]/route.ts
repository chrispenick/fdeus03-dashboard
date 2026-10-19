import { isAdmin, unauthorized } from "@/lib/auth";
import { pool } from "@/lib/db";

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
  const members = (b.members ?? []).map((m: string) => String(m).trim()).filter(Boolean);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE teams SET name=$2, project_name=$3, description=$4, status=$5, tags=$6, slot_order=$7, slot_time=$8, room=$9 WHERE id=$1`,
      [id, String(b.name).trim(), b.project_name ?? "", b.description ?? "", b.status,
       (b.tags ?? []).map((t: string) => t.trim()).filter(Boolean),
       b.slot_order === "" || b.slot_order == null ? null : Number(b.slot_order), b.slot_time ?? "", String(b.room ?? "").trim()]
    );
    await client.query("DELETE FROM members WHERE team_id=$1", [id]);
    for (const m of members) await client.query("INSERT INTO members (team_id,name) VALUES ($1,$2)", [id, m]);
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
