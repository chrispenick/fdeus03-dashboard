import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { parseRoster } from "./parse";

// Applies schema (idempotent) and seeds the roster when the teams table is empty.
// Pass --force to wipe and reseed teams/members/links.
async function main(force = false) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await pool.query(readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  if (force) await pool.query("TRUNCATE teams RESTART IDENTITY CASCADE");
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM teams");
  if (rows[0].n === 0) {
    const teams = parseRoster(readFileSync(path.join(__dirname, "FDEUS03_Capstone_Teams.txt"), "utf8"));
    for (const t of teams) {
      const r = await pool.query(
        "INSERT INTO teams (number, breed, name, slot_order) VALUES ($1,$2,$3,$1) RETURNING id",
        [t.number, t.breed, t.name]
      );
      for (const m of t.members)
        await pool.query("INSERT INTO members (team_id, name) VALUES ($1,$2)", [r.rows[0].id, m]);
    }
    const c = await pool.query("SELECT (SELECT count(*) FROM teams) t, (SELECT count(*) FROM members) m");
    console.log(`Seeded ${c.rows[0].t} teams / ${c.rows[0].m} members`);
  } else console.log("Teams already present; skipping seed");
  await pool.query("INSERT INTO settings (key,value) VALUES ('scores_revealed','false') ON CONFLICT DO NOTHING");
  await pool.end();
}
main(process.argv.includes("--force")).catch((e) => {
  console.error(e);
  process.exit(1);
});
