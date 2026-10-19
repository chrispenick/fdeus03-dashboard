import { isAdmin, unauthorized } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { scores_revealed } = await req.json();
  await query(
    "INSERT INTO settings (key,value) VALUES ('scores_revealed',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
    [scores_revealed ? "true" : "false"]
  );
  return Response.json({ ok: true });
}
