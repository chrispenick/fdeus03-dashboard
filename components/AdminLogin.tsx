"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
    if (r.ok) router.refresh();
    else setErr((await r.json()).error);
  }
  return (
    <form onSubmit={submit} className="panel" style={{ maxWidth: 360 }}>
      <h1>Admin</h1>
      <div className="row">
        <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <button className="primary">Sign in</button>
      </div>
      {err && <p className="err">{err}</p>}
    </form>
  );
}
