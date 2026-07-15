"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface CreateTaskParams {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  due_date: string;
  column_id: string;
  team: string;
  owner_name: string;
  start_date?: string | null;
  end_date?: string | null;
}

/**
 * TẠO MỚI CỘT/CÔNG ĐOẠN ĐỘNG
 */
export async function createColumnAction(title: string) {
  try {
    const supabase = await createClient();
    const id = title.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const { data: cols } = await supabase.from("kanban_columns").select("position");
    const maxPos = cols?.reduce((max, c) => Math.max(max, c.position || 0), 0) || 0;

    const { error } = await supabase.from("kanban_columns").insert([{ id, title, position: maxPos + 1 }]);

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * XÓA CỘT/CÔNG ĐOẠN ĐỘNG
 */
export async function deleteColumnAction(columnId: string) {
  try {
    const supabase = await createClient();
    await supabase.from("kanban_tasks").delete().eq("column_id", columnId);
    const { error } = await supabase.from("kanban_columns").delete().eq("id", columnId);

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * CẬP NHẬT TRẠNG THÁI CỘT KHI KÉO THẢ
 */
export async function updateTaskColumnAction(taskId: string, columnId: string) {
  try {
    const supabase = await createClient();
    const updateData: any = { column_id: columnId };

    if (columnId === "shipped") {
      updateData.progress = 100;
    } else if (columnId === "ideas") {
      updateData.progress = 0;
    }

    const { error } = await supabase.from("kanban_tasks").update(updateData).eq("id", taskId);

    if (error) throw error;

    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * TẠO MỚI MỘT NHIỆM VỤ IN LÊN SUPABASE
 */
export async function createTaskAction(params: CreateTaskParams) {
  try {
    const supabase = await createClient();
    const { error, data } = await supabase
      .from("kanban_tasks")
      .insert([
        {
          title: params.title,
          description: params.description,
          priority: params.priority,
          due_date: params.due_date || "25 thg 7",
          start_date: params.start_date || null,
          end_date: params.end_date || null,
          progress: params.column_id === "shipped" ? 100 : 15,
          column_id: params.column_id,
          team: params.team || "Product",
          owner_name: params.owner_name || "Trọng Tôn",
          owner_tone: "[&_[data-slot=avatar-fallback]]:bg-emerald-100 [&_[data-slot=avatar-fallback]]:text-emerald-700",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * CHỈNH SỬA CÔNG VIỆC THỜI GIAN THỰC (EDIT TASK)
 */
export async function updateTaskAction(taskId: string, fields: Partial<CreateTaskParams & { progress: number }>) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("kanban_tasks").update(fields).eq("id", taskId);

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * LƯU TRỮ CÁC NHIỆM VỤ ĐÃ HOÀN THÀNH (ARCHIVE COMPLETED)
 */
export async function archiveCompletedTasksAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("kanban_tasks").update({ archived: true }).eq("column_id", "shipped");

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * XÓA NHIỆM VỤ KANBAN
 */
export async function deleteTaskAction(taskId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("kanban_tasks").delete().eq("id", taskId);
    if (error) throw error;

    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * THAO TÁC BÌNH LUẬN: GỬI BÌNH LUẬN THẬT LÊN SUPABASE
 */
export async function createCommentAction(taskId: string, authorName: string, content: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("kanban_comments")
      .insert([{ task_id: taskId, author_name: authorName, content }]);

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * THAO TÁC ĐÍNH KÈM: THÊM FILE ĐÍNH KÈM LÊN SUPABASE
 */
export async function createAttachmentAction(taskId: string, name: string, url: string, size: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("kanban_attachments").insert([{ task_id: taskId, name, url, size }]);

    if (error) throw error;
    revalidatePath("/dashboard/kanban");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
