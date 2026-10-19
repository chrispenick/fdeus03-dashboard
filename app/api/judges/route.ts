import { randomBytes } from "node:crypto";
import { isAdmin, unauthorized } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await query("SELECT id, name, token FROM judges ORDER BY id"));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { name } = await req.json();
  if (!String(name ?? "").trim()) return Response.json({ error: "name required" }, { status: 400 });
  await query("INSERT INTO judges (name, token) VALUES ($1,$2)", [name.trim(), randomBytes(18).toString("base64url")]);
  return Response.json({ ok: true });
}
