import type { Column, TaskTeam } from "./types";

export const columns = [
  { id: "ideas", title: "Ý tưởng in" },
  { id: "planned", title: "Lên lịch in" },
  { id: "building", title: "Đang in 3D" },
  { id: "qa", title: "Kiểm định phôi" },
  { id: "shipped", title: "Đã bàn giao" },
] as const satisfies readonly Column[];

export const columnIds = columns.map((column) => column.id);

export const tagTones: Record<TaskTeam, string> = {
  Backend: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Data: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Design: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  Docs: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "Finance Ops": "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  Platform: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  Product: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  QA: "bg-red-500/10 text-red-700 dark:text-red-300",
  Security: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};
