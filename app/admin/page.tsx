import { isAdmin } from "@/lib/auth";
import { getReviews, getTeams, scoresRevealed } from "@/lib/data";
import { query } from "@/lib/db";
import AdminPanel from "@/components/AdminPanel";
import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await isAdmin())) return <AdminLogin />;
  const [teams, reviews, judges, revealed] = await Promise.all([
    getTeams(), getReviews(), query("SELECT id, name, token FROM judges ORDER BY id"), scoresRevealed(),
  ]);
  return <AdminPanel teams={teams} reviews={reviews} judges={judges} revealed={revealed} />;
}
