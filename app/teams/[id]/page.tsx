import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import TeamDetail from "@/components/TeamDetail";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const team = Number.isInteger(id) ? await getTeam(id) : null;
  if (!team) notFound();
  return (
    <div className="panel">
      <Link href="/">← All teams</Link>
      <TeamDetail team={team} />
    </div>
  );
}
