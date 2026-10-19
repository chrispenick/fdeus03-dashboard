export type ParsedTeam = { number: number; breed: string; name: string; members: string[] };

// Roster typos to normalise; flagged for the user to confirm.
const FIXES: Record<string, string> = { "Michael Skelton (Lee?)": "Michael Skelton" };

export function parseRoster(text: string): ParsedTeam[] {
  const teams: ParsedTeam[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const h = line.match(/^Team (\d+) — (.+?) \((\d+) members?\) (.+)$/);
    if (h) {
      teams.push({ number: +h[1], breed: h[2], name: h[4], members: [] });
    } else if (line && teams.length && !/^[=]+$/.test(line)) {
      teams[teams.length - 1].members.push(FIXES[line] ?? line);
    }
  }
  return teams;
}
