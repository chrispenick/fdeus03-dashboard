import { checkPassword, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !checkPassword(password))
    return Response.json({ error: "Wrong password" }, { status: 401 });
  await setSession();
  return Response.json({ ok: true });
}
