import { isAdmin, unauthorized } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { currentSlot } = await req.json().catch(() => ({}));
  const [{ n }] = (await pool.query("SELECT COUNT(*)::int AS n FROM teams")).rows;
  if (!Number.isInteger(currentSlot) || currentSlot < 0 || currentSlot > n + 1)
    return Response.json({ error: "currentSlot must be an integer from 0 to " + (n + 1) }, { status: 400 });
  await pool.query("INSERT INTO settings (key,value) VALUES ('schedule_current_slot',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [String(currentSlot)]);
  return Response.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { order, settings } = await req.json();
  if (!Array.isArray(order)) return Response.json({ error: "bad request" }, { status: 400 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < order.length; i++)
      await client.query("UPDATE teams SET slot_order=$2, slot_time=$3 WHERE id=$1", [Number(order[i].id), i + 1, String(order[i].time ?? "")]);
    if (settings) {
      const kv: [string, string][] = [
        ["schedule_start", String(settings.start ?? "")], ["schedule_slot_min", String(Number(settings.slotMin) || 0)],
        ["schedule_break_min", String(Number(settings.breakMin) || 0)], ["schedule_break_time", String(settings.breakTime ?? "")],
      ];
      for (const [k, val] of kv)
        await client.query("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [k, val]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    return Response.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
  return Response.json({ ok: true });
}
