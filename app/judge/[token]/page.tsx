import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getTeams } from "@/lib/data";
import JudgeForm from "@/components/JudgeForm";
import JudgeAdminLink from "@/components/JudgeAdminLink";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function JudgePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [judge] = await query("SELECT id, name FROM judges WHERE token=$1", [token]);
  if (!judge) notFound();
  const [teams, reviews] = await Promise.all([
    getTeams(),
    query("SELECT team_id, verdict, notes FROM reviews WHERE judge_id=$1", [judge.id]),
  ]);
  return (
    <>
      <h1>Judging — {judge.name}</h1>
      <p className="sub">Choose Pass, Pass with notes, or Not pass for each team. Notes are visible to organizers only. You can revise any time.</p>
      <p><JudgeAdminLink token={token} /></p>
      <JudgeForm token={token} teams={teams.map((t) => ({ id: t.id, number: t.number, name: t.name, project: t.project_name }))} initial={reviews} />
    </>
  );
}
