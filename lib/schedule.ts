export const BREAK_AFTER = 6; // first half = presentations 1-6, second half = 7-12

export type ScheduleSettings = { start: string; slotMin: number; breakMin: number; breakTime: string };

const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const timeFmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const range = (a: Date, b: Date) =>
  `${dateFmt(a)}, ${timeFmt(a)} – ${dateFmt(a) === dateFmt(b) ? "" : dateFmt(b) + ", "}${timeFmt(b)}`;

// start: "YYYY-MM-DDTHH:mm" (datetime-local). Returns one label per slot plus the break label ("" if no break).
export function buildSchedule(start: string, slotMin: number, breakMin: number, count: number) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(start);
  if (!m || !(slotMin > 0)) return null;
  let t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
  const times: string[] = [];
  let breakTime = "";
  for (let i = 0; i < count; i++) {
    if (i === BREAK_AFTER && breakMin > 0) {
      breakTime = range(new Date(t), new Date(t + breakMin * 60000));
      t += breakMin * 60000;
    }
    times.push(range(new Date(t), new Date(t + slotMin * 60000)));
    t += slotMin * 60000;
  }
  return { times, breakTime };
}
