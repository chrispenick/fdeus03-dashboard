import { getTeams } from "@/lib/data";
import TeamGrid from "@/components/TeamGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const teams = await getTeams();
  const people = teams.reduce((a, t) => a + t.members.length, 0);
  return (
    <>
      <h1>Capstone Teams</h1>
      <p className="sub">{teams.length} teams · {people} people</p>
      <TeamGrid teams={teams} />
    </>
  );
}
