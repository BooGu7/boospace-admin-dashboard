export type ColumnId = string; // ĐÃ SỬA: Chuyển sang string để hỗ trợ thêm/xóa công đoạn in động từ Supabase

export type Column = {
  id: string;
  title: string;
};

export type TaskTeam = string; // ĐÃ SỬA: Cho phép người dùng tự gõ thêm bớt nhóm phụ trách (Platform, Design...) tự do

export type TaskPriority = "High" | "Medium" | "Low";

export type TaskInsightLabel = "Attachments" | "Comments" | "Documents";

export type TaskInsight = {
  label: TaskInsightLabel;
  count: number;
};

export type TaskOwnerProfile = {
  name: string;
  tone: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  progress: number;
  owner: TaskOwnerProfile;
  team: TaskTeam;
  insights: TaskInsight[];
};

export type BoardState = Record<string, Task[]>; // ĐÃ SỬA: Cho phép lập chỉ mục linh hoạt bằng chuỗi id động từ Supabase
