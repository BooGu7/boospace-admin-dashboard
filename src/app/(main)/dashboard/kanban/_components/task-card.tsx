"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Calendar, // ĐỒNG BỘ: Bổ sung import bị thiếu ở đây
  CalendarDays,
  FileText,
  Flame,
  Loader2,
  type LucideIcon,
  MessageSquare,
  Minus,
  Paperclip,
  Pencil,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  createAttachmentAction,
  createCommentAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/actions/kanban.actions";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import { tagTones } from "./data";
import type { ColumnId, Task, TaskInsightLabel, TaskPriority } from "./types";

const taskInsightIcons: Record<TaskInsightLabel, LucideIcon> = {
  Attachments: Paperclip,
  Comments: MessageSquare,
  Documents: FileText,
};

const priorityBadgeConfig: Record<
  TaskPriority,
  { icon: LucideIcon; variant: "destructive" | "secondary"; className: string }
> = {
  High: {
    icon: Flame,
    variant: "destructive",
    className: "border-transparent",
  },
  Low: {
    icon: Minus,
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  },
  Medium: {
    icon: ArrowUpRight,
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

export function TaskCard({
  task,
  columnId,
  isOverlay = false,
}: {
  task: Task;
  columnId?: ColumnId;
  isOverlay?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const isDone = columnId === "shipped";
  const showBuildingDetails = columnId === "building" && typeof task.progress === "number";
  const owner = task.owner;
  const PriorityIcon = priorityBadgeConfig[task.priority].icon;

  // Hộp thoại chỉnh sửa Task
  const [openEdit, setOpenEdit] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [editTitle, setEditTitle] = React.useState(task.title);
  const [editDesc, setEditDesc] = React.useState(task.description);
  const [editPriority, setEditPriority] = React.useState(task.priority);
  const [editDate, _setEditDate] = React.useState(task.dueDate);
  const [editProgress, setEditProgress] = React.useState(task.progress);

  // Mốc ngày thời gian mới
  const [editStartDate, setEditStartDate] = React.useState((task as any).startDate || "");
  const [editEndDate, setEditEndDate] = React.useState((task as any).endDate || "");

  // Hộp thoại Comments & Đính kèm
  const [openComments, setOpenComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");

  // Quản lý upload file thật lên Supabase Storage
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const commentsList = (task as any).realComments || [];
  const attachmentsList = (task as any).realAttachments || [];

  const handleSaveEdit = () => {
    startTransition(async () => {
      // Tự động đồng bộ hóa hiển thị nhãn ngày
      const displayDateLabel = editEndDate
        ? new Date(editEndDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
          })
        : editDate;

      const res = await updateTaskAction(task.id, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        due_date: displayDateLabel,
        progress: Number(editProgress),
        start_date: editStartDate || null,
        end_date: editEndDate || null,
      } as any);

      if (res.success) {
        toast.success("Đã lưu chỉnh sửa công việc!");
        setOpenEdit(false);
        router.refresh();
      } else {
        toast.error("Lỗi cập nhật.");
      }
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    startTransition(async () => {
      const res = await createCommentAction(task.id, owner.name, commentText);
      if (res.success) {
        toast.success("Đã đăng bình luận!");
        setCommentText("");
        router.refresh();
      }
    });
  };

  // NÚT XÓA NHANH TÍCH HỢP TRỰC TIẾP TRÊN CARD
  const handleQuickDelete = () => {
    if (!confirm(`Xóa vĩnh viễn nhiệm vụ in "${task.title}" khỏi Supabase?`)) return;
    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (res.success) {
        toast.success(`Đã xóa công việc "${task.title}" thành công.`);
        router.refresh();
      } else {
        toast.error("Lỗi khi xóa.");
      }
    });
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      toast.info(`Đang tải file "${file.name}" lên Supabase...`);

      const fileExt = file.name.split(".").pop();
      const fileName = `${task.id}-${Date.now()}.${fileExt}`;
      const filePath = `tasks/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("kanban_attachments").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("kanban_attachments").getPublicUrl(filePath);

      const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      const res = await createAttachmentAction(task.id, file.name, publicUrl, fileSize);

      if (res.success) {
        toast.success("Tải tệp đính kèm lên Supabase thành công!");
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(`Lỗi đăng tải file: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formattedStartDate = (task as any).startDate
    ? new Date((task as any).startDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "numeric",
      })
    : null;
  const formattedEndDate = (task as any).endDate
    ? new Date((task as any).endDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "numeric",
      })
    : task.dueDate;

  return (
    <>
      <article
        className={cn(
          "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs group/card relative",
          isOverlay && "w-68 rotate-1 shadow-lg",
        )}
      >
        {/* NÚT EDIT BÚT CHÌ TRÊN CARD */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenEdit(true);
          }}
          className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover/card:opacity-100 bg-muted hover:bg-muted/80 text-slate-700 transition z-20 cursor-pointer"
          title="Chỉnh sửa công việc"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* ĐÃ THÊM: NÚT XÓA NHANH THÙNG RÁC ĐỎ TRÊN THẺ CARD KHI HOVER */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickDelete();
          }}
          className="absolute top-3 right-9 p-1 rounded-md opacity-0 group-hover/card:opacity-100 bg-red-50 hover:bg-red-100 text-red-600 transition z-20 cursor-pointer"
          title="Xóa công việc ngay"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="min-w-0 truncate font-bold text-sm text-slate-800 pr-10">{task.title}</h3>
            <Badge
              variant={priorityBadgeConfig[task.priority].variant}
              className={cn(
                "shrink-0 rounded-md border-transparent px-2 font-medium text-[10px]",
                priorityBadgeConfig[task.priority].className,
              )}
            >
              <PriorityIcon data-icon="inline-start" />
              {task.priority === "High" ? "Cao" : task.priority === "Medium" ? "Trung bình" : "Thấp"}
            </Badge>
          </div>
          <p className="line-clamp-2 text-muted-foreground text-xs leading-5">{task.description}</p>
        </div>

        {!showBuildingDetails ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
                <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs font-bold">{owner.name}</span>
            </div>

            {/* ĐÃ SỬA: Hiển thị cả ngày bắt đầu và kết thúc dạng 14/07 - 18/07 rực rỡ */}
            <div
              onClick={() => setOpenEdit(true)}
              className="flex min-w-0 items-center gap-1 text-muted-foreground cursor-pointer hover:text-slate-800"
            >
              <span className="truncate text-[10px] font-bold font-mono">
                {formattedStartDate ? `${formattedStartDate} - ` : ""}
                {formattedEndDate}
              </span>
              <CalendarDays className="size-3 shrink-0" />
            </div>
          </div>
        ) : null}

        {showBuildingDetails ? (
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
                <span className="leading-none">Tiến độ in</span>
                <span className="tabular-nums leading-none">{task.progress}%</span>
              </div>
              <Progress value={task.progress} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs font-bold">Thợ in</span>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-muted-foreground text-xs font-semibold">{owner.name}</span>
                  <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
                    <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* ĐÃ SỬA: Hiển thị cả ngày bắt đầu và kết thúc tại chi tiết cột building */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs font-bold">Thời hạn</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="truncate text-[10px] font-mono font-bold">
                    {formattedStartDate ? `${formattedStartDate} - ` : ""}
                    {formattedEndDate}
                  </span>
                  <CalendarDays className="size-3 shrink-0" />
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs font-bold">Công việc</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-md border-transparent px-2 font-bold text-[10px]",
                    tagTones[task.team] || "bg-slate-100 text-slate-700",
                  )}
                >
                  {task.team}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}

        <Separator />

        {/* CLICK VÀO COMMENTS ĐỂ MỞ DRAWER BÌNH LUẬN THẬT */}
        <div onClick={() => setOpenComments(true)} className="cursor-pointer hover:text-slate-800">
          {isDone ? (
            <div className="flex items-center gap-1 font-extrabold text-green-700 text-xs dark:text-green-600">
              <BadgeCheck className="size-4 shrink-0" />
              Hoàn tất bưu cục
            </div>
          ) : null}

          {!isDone ? (
            <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold">
              {task.insights.map((insight) => {
                const Icon = taskInsightIcons[insight.label];
                return (
                  <span key={insight.label} className="flex items-center gap-1 text-xs">
                    <Icon className="size-3.5 shrink-0" />
                    {insight.count}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </article>

      {/* DIALOG CHỈNH SỬA CÔNG VIỆC THỜI GIAN THỰC */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[400px] text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold text-slate-800">
              <Pencil className="h-4.5 w-4.5 text-primary" /> Chỉnh sửa công việc in
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Tên nhiệm vụ</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Ghi chú kỹ thuật / Quy trình</Label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full min-h-[80px] p-3 text-xs border rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700">Độ ưu tiên</Label>
                <select
                  className="w-full h-9 border rounded-lg px-2 bg-background text-xs font-semibold"
                  value={editPriority}
                  onChange={(e: any) => setEditPriority(e.target.value)}
                >
                  <option value="High">Cao (High)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="Low">Thấp (Low)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700">Tag công việc (Team)</Label>
                <Input value={task.team} disabled className="h-9 text-xs font-bold bg-muted" />
              </div>
            </div>

            {/* SỬA NGÀY BẮT ĐẦU VÀ KẾT THÚC ĐỘNG TRỰC TIẾP TRÊN TRÌNH DUYỆT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-bold text-[10px] text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Từ ngày
                </Label>
                <Input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-[10px] text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Đến ngày
                </Label>
                <Input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-[11px] text-slate-700">Tiến độ phần trăm in ({editProgress}%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="h-9 text-xs font-mono font-bold text-blue-900"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpenEdit(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={isPending} className="bg-black text-white font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu lên Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG GỬI BÌNH LUẬN & ĐÍNH KÈM TỆP TIN THẬT LÊN STORAGE */}
      <Dialog open={openComments} onOpenChange={setOpenComments}>
        <DialogContent className="sm:max-w-[400px] text-xs">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-800 text-base flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5 text-primary" /> Hộp thảo luận & Tài liệu đính kèm
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Quản lý và bám sát tiến độ phôi thiết kế in của xưởng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Lịch sử bình luận động nạp từ Supabase */}
            <div className="rounded-lg bg-slate-50 border p-3.5 space-y-2 dark:bg-slate-900 max-h-[160px] overflow-y-auto">
              <p className="font-bold text-slate-800">Lịch sử thiết kế ({commentsList.length}):</p>
              <div className="space-y-2 mt-2">
                {commentsList.map((c: any) => (
                  <div key={c.id} className="text-[11px] border-b pb-1.5 last:border-0 last:pb-0">
                    <p className="text-slate-600 font-medium">
                      <strong className="text-slate-800 font-bold">{c.author_name}</strong>: {c.content}
                    </p>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                      {new Date(c.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                ))}
                {commentsList.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Chưa có thảo luận nào cho nhiệm vụ này.</p>
                )}
              </div>
            </div>

            {/* Danh sách tệp đính kèm thật */}
            <div className="rounded-lg bg-slate-50 border p-3.5 space-y-2 dark:bg-slate-900 max-h-[120px] overflow-y-auto">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-800">Tệp tin G-code/STL ({attachmentsList.length}):</span>
                {/* Ẩn input file gốc, kích hoạt qua click nút bưu cục */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadFile}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-6 font-bold gap-1 text-[10px]"
                >
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  Đính kèm File
                </Button>
              </div>
              <div className="space-y-1.5 mt-2">
                {attachmentsList.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-1 bg-white border rounded-md">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[200px] font-medium"
                    >
                      {a.name}
                    </a>
                    <span className="text-[9px] text-muted-foreground font-mono">{a.size}</span>
                  </div>
                ))}
                {attachmentsList.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Chưa có tệp tin đính kèm nào.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Đăng bình luận mới</Label>
              <Input
                placeholder="Nhập nội dung thảo luận kỹ thuật..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddComment}
              className="bg-black text-white font-bold text-xs h-9 cursor-pointer w-full"
            >
              Đăng bình luận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
