export type Status = "not_started" | "in_progress" | "demo_ready";
export type Link = { id: number; kind: "repo" | "demo" | "slides" | "chat"; url: string };
export type Team = {
  id: number; number: number; breed: string; name: string; project_name: string; description: string;
  status: Status; tags: string[]; slot_order: number | null; slot_time: string; room: string;
  members: { id: number; name: string }[]; links: Link[];
};

export const STATUS_LABEL: Record<Status, string> = {
  not_started: "Not started", in_progress: "In progress", demo_ready: "Demo-ready",
};

export type Verdict = "pass" | "pass_notes" | "not_pass";
export const VERDICT_LABEL: Record<Verdict, string> = {
  pass: "Pass", pass_notes: "Pass with notes", not_pass: "Not pass",
};
