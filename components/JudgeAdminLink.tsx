"use client";
import { useRouter } from "next/navigation";

export default function JudgeAdminLink({ token }: { token: string }) {
  const router = useRouter();
  return (
    <button onClick={async () => {
      const r = await fetch("/api/admin/judge-login", { method: "POST", body: JSON.stringify({ token }) });
      if (r.ok) router.push("/admin");
    }}>Open admin</button>
  );
}
