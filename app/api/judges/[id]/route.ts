import { isAdmin, unauthorized } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return unauthorized();
  await query("DELETE FROM judges WHERE id=$1", [Number((await params).id)]);
  return Response.json({ ok: true });
}
