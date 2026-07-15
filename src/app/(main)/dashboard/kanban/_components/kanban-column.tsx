"use client";

import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { deleteColumnAction } from "@/actions/kanban.actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SortableTaskCard } from "./sortable-task-card";
import type { Column, Task } from "./types";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onQuickAdd: (colId: string) => void; // Gắn kết hành động cộng nhanh bưu tá
}

export function KanbanColumn({ column, tasks, onQuickAdd }: KanbanColumnProps) {
  const router = useRouter();
  const [_isPending, startTransition] = React.useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const handleDeleteColumn = () => {
    if (!confirm(`Xóa toàn bộ công đoạn "${column.title}" và các nhiệm vụ bên dưới vĩnh viễn?`)) return;

    startTransition(async () => {
      const res = await deleteColumnAction(column.id);
      if (res.success) {
        toast.success(`Đã xóa công đoạn "${column.title}" khỏi Supabase.`);
        router.refresh();
      } else {
        toast.error("Không thể xóa công đoạn.");
      }
    });
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        "flex min-h-0 flex-col rounded-t-xl border bg-muted/50 transition-colors",
        isOver && "bg-muted/70",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="-ml-2 cursor-grab text-foreground/70 active:cursor-grabbing"
              aria-label={`Drag ${column.title} column`}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
            <h2 className="truncate font-bold text-sm text-slate-800 leading-none">{column.title}</h2>
          </div>
          <p className="text-muted-foreground text-xs font-semibold tabular-nums leading-none">
            {tasks.length} {tasks.length === 1 ? "nhiệm vụ" : "nhiệm vụ"}
          </p>
        </div>

        {/* HÀNH ĐỘNG ĐẦU CỘT: Thêm nhanh và Xóa công đoạn */}
        <div className="-mr-2 flex items-center gap-0.5 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onQuickAdd(column.id)} // Gọi hàm cộng nhanh
            title="Thêm việc nhanh vào cột này"
          >
            <Plus className="h-4 w-4 text-slate-700" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" title="Tùy chọn cột">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteColumn}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Xóa công đoạn (Xóa cột)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        {tasks.map((task) => (
          <SortableTaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>
    </section>
  );
}
