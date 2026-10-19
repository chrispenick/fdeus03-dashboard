import { setSession } from "@/lib/auth";
import { query } from "@/lib/db";

// Judges are instructors: a valid judge token grants an admin session.
export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  const [judge] = typeof token === "string" ? await query("SELECT id FROM judges WHERE token=$1", [token]) : [];
  if (!judge) return Response.json({ error: "invalid link" }, { status: 401 });
  await setSession();
  return Response.json({ ok: true });
}
