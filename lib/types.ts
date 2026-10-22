export type Status = "not_started" | "in_progress" | "demo_ready";
export type Link = { id: number; kind: "repo" | "demo" | "slides" | "chat"; url: string };
export type Team = {
  id: number; number: number; breed: string; name: string; project_name: string; description: string;
  status: Status; tags: string[]; slot_order: number | null; slot_time: string; room: string;
  members: { id: number; name: string; notes: string }[]; links: Link[];
  grades: Record<string, Verdict>; grade_notes: string;
};

export const STATUS_LABEL: Record<Status, string> = {
  not_started: "Not started", in_progress: "In progress", demo_ready: "Demo-ready",
};

export type Verdict = "pass" | "pass_notes" | "not_pass";
export const VERDICT_LABEL: Record<Verdict, string> = {
  pass: "Pass", pass_notes: "Pass with notes", not_pass: "Not pass",
};

export const GRADE_SECTIONS = [
  { key: "agent_functionality", label: "Agent functionality and correctness" },
  { key: "spec_design", label: "Spec-driven design quality" },
  { key: "engineering", label: "Engineering quality" },
  { key: "rapid_controls", label: "RAPID controls execution (FedEx-specific)" },
  { key: "ai_dev_practice", label: "AI-assisted development practice" },
  { key: "demo_comms", label: "Demonstration and communication" },
] as const;
export const GRADE_OPTIONS: Record<Verdict, string> = {
  pass: "PASS", pass_notes: "PASS with notes", not_pass: "NOT PASS with notes",
};
export function capstoneResult(grades: Record<string, string> | null | undefined): "pass" | "not_pass" | "pending" {
  const g = grades ?? {};
  if (GRADE_SECTIONS.some((s) => g[s.key] === "not_pass")) return "not_pass";
  return GRADE_SECTIONS.every((s) => g[s.key] === "pass" || g[s.key] === "pass_notes") ? "pass" : "pending";
}
