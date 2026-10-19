import { isAdmin, unauthorized } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { order } = await req.json();
  if (!Array.isArray(order)) return Response.json({ error: "bad request" }, { status: 400 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < order.length; i++)
      await client.query("UPDATE teams SET slot_order=$2, slot_time=$3 WHERE id=$1", [Number(order[i].id), i + 1, String(order[i].time ?? "")]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    return Response.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
  return Response.json({ ok: true });
}
