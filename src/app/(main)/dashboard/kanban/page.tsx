import { createClient } from "@/lib/supabase/server";
import { Kanban } from "./_components/kanban";
import type { BoardState } from "./_components/types";

export const revalidate = 0; // Đảm bảo luôn làm mới khi F5

export default async function Page() {
  const supabase = await createClient();

  // 1. Tải song song danh sách các cột, bưu bưu tá, bình luận, và tệp đính kèm (Nạp toàn bộ đơn gồm cả lưu trữ)
  const [colsRes, tasksRes, commentsRes, attachmentsRes] = await Promise.all([
    supabase.from("kanban_columns").select("*").order("position", { ascending: true }),
    supabase.from("kanban_tasks").select("*").eq("archived", false), // Chỉ nạp các bưu bưu tá chưa bị Lưu trữ
    supabase.from("kanban_comments").select("*").order("created_at", { ascending: true }),
    supabase.from("kanban_attachments").select("*").order("created_at", { ascending: true }),
  ]);

  const dbColumns = colsRes.data || [];
  const dbTasks = tasksRes.data || [];
  const dbComments = commentsRes.data || [];
  const dbAttachments = attachmentsRes.data || [];

  // ĐÃ SỬA: Ép kiểu as any khi khởi tạo để cho phép gán thuộc tính động theo cột tải từ database
  const board = {} as any;
  for (const col of dbColumns) {
    board[col.id] = [];
  }

  // 2. Phân bổ và bọc các mảng liên quan vào từng đối tượng Task để hiển thị động
  if (dbTasks) {
    for (const task of dbTasks) {
      const colId = task.column_id;
      if (board[colId]) {
        // Lọc bình luận và đính kèm của riêng bưu bưu tá này
        const taskComments = dbComments.filter((c) => c.task_id === task.id);
        const taskAttachments = dbAttachments.filter((a) => a.task_id === task.id);

        board[colId].push({
          id: task.id,
          title: task.title,
          description: task.description || "",
          priority: task.priority as any,
          dueDate: task.due_date,
          progress: task.progress || 0,
          owner: {
            name: task.owner_name,
            tone: task.owner_tone,
          },
          team: task.team as any,
          insights: [
            { label: "Comments", count: taskComments.length },
            { label: "Attachments", count: taskAttachments.length },
          ],
          realComments: taskComments,
          realAttachments: taskAttachments,
          startDate: task.start_date || null,
          endDate: task.end_date || null,
          archived: !!task.archived, // ĐỒNG BỘ: Chuyển khóa trạng thái lưu trữ xuống Client
        } as any);
      }
    }
  }

  return (
    <div data-content-padding="false" className="h-full">
      {/* ĐÃ SỬA: Ép ngược kiểu về BoardState ở tham số truyền đầu ra an toàn */}
      <Kanban initialBoard={board as BoardState} dbColumns={dbColumns} />
    </div>
  );
}
