"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  Archive,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Kanban as KanbanIcon,
  List,
  Loader2,
  Plus,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Table2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  archiveCompletedTasksAction,
  createColumnAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
  updateTaskColumnAction,
} from "@/actions/kanban.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import type { BoardState, ColumnId, Task } from "./types";
import { findColumnId, findTask } from "./utils";

interface KanbanProps {
  initialBoard: BoardState;
  dbColumns: any[];
}

export function Kanban({ initialBoard, dbColumns }: KanbanProps) {
  const router = useRouter();
  const supabase = createClient();

  const [board, setBoard] = React.useState<BoardState>(initialBoard);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = React.useState<ColumnId | null>(null);
  const boardBeforeDrag = React.useRef<BoardState | null>(null);

  const columnOrder = dbColumns.map((c) => c.id);

  // Các trạng thái tương tác động mới
  const [view, setView] = React.useState("board");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // ĐỒNG BỘ: Tải thông tin tài khoản đang đăng nhập bưu tá thật
  const [adminUser, setAdminUser] = React.useState({
    name: "Trọng Tôn",
    email: "boospace7@gmail.com",
  });

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminUser({
          name: user.user_metadata?.firstName
            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ""}`
            : user.email?.split("@")[0] || "Trọng Tôn",
          email: user.email || "boospace7@gmail.com",
        });
      }
    });
  }, [supabase]);

  // Form Thêm cột mới
  const [openAddCol, setOpenAddCol] = React.useState(false);
  const [newColTitle, setNewColTitle] = React.useState("");

  // Form Thêm việc mới
  const [openAdd, setOpenAdd] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<"High" | "Medium" | "Low">("Medium");
  const [newCol, setNewCol] = React.useState("ideas");
  const [newTeam, setNewTeam] = React.useState("In thô");

  // Thời gian mới
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  React.useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // PHÂN LOẠI ĐỘNG: Chỉ hiển thị các task CHƯA lưu trữ ở các view hoạt động thường
  const activeBoard = React.useMemo(() => {
    const nextBoard = {} as any;
    for (const id of columnOrder) {
      nextBoard[id] = ((board as any)[id] || []).filter((t: any) => !t.archived);
    }
    return nextBoard as BoardState;
  }, [board, columnOrder]);

  // PHÂN LOẠI ĐỘNG: Chỉ nạp các task ĐÃ lưu trữ (Archived) phục vụ Tab xem lại
  const archivedTasksList = React.useMemo(() => {
    return Object.values(board)
      .flat()
      .filter((t: any) => t.archived);
  }, [board]);

  // LỌC VÀ SẮP XẾP DỮ LIỆU ĐỘNG TRÊN TRÌNH DUYỆT (CLIENT-SIDE)
  const processedBoard = React.useMemo(() => {
    const nextBoard = {} as any;
    for (const id of columnOrder) {
      nextBoard[id] = [];
    }

    for (const key of Object.keys(activeBoard) as ColumnId[]) {
      let tasks = activeBoard[key] || [];

      if (searchQuery.trim() !== "") {
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (filterPriority) {
        tasks = tasks.filter((t) => t.priority === filterPriority);
      }

      tasks = [...tasks].sort((a, b) => {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      });

      nextBoard[key] = tasks;
    }

    return nextBoard as BoardState;
  }, [activeBoard, searchQuery, filterPriority, sortOrder, columnOrder]);

  const handleQuickAddTask = (colId: string) => {
    setNewCol(colId);
    setOpenAdd(true);
  };

  const handleSaveTask = () => {
    if (!newTitle.trim()) {
      toast.error("Vui lòng điền tiêu đề công việc.");
      return;
    }

    startTransition(async () => {
      const res = await createTaskAction({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        due_date: endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "25 thg 7",
        start_date: startDate || null,
        end_date: endDate || null,
        column_id: newCol,
        team: newTeam,
        owner_name: adminUser.name,
      });

      if (res.success) {
        toast.success(`Đã thêm công việc in "${newTitle}" lên Supabase!`);
        setOpenAdd(false);
        setNewTitle("");
        setNewDesc("");
        setNewPriority("Medium");
        setNewCol("ideas");
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi tạo.");
      }
    });
  };

  const handleSaveColumn = () => {
    if (!newColTitle.trim()) {
      toast.error("Vui lòng nhập tên công đoạn.");
      return;
    }

    startTransition(async () => {
      const res = await createColumnAction(newColTitle);
      if (res.success) {
        toast.success(`Đã thêm công đoạn "${newColTitle}" lên Supabase!`);
        setOpenAddCol(false);
        setNewColTitle("");
        router.refresh();
      } else {
        toast.error(res.error || "Lỗi tạo công đoạn");
      }
    });
  };

  // KÍCH HOẠT HÀNH ĐỘNG LƯU TRỮ (ARCHIVE COMPLETED TASKS)
  const handleArchiveCompleted = () => {
    if (!confirm("Di chuyển toàn bộ các nhiệm vụ đã giao bưu cục hoàn thành vào mục lưu trữ?")) return;
    startTransition(async () => {
      const res = await archiveCompletedTasksAction();
      if (res.success) {
        toast.success("Đã dọn dẹp và lưu trữ các bưu bưu tá hoàn thành thành công!");
        router.refresh();
      }
    });
  };

  const handleRestoreTask = (taskId: string) => {
    startTransition(async () => {
      const res = await updateTaskAction(taskId, { archived: false } as any);
      if (res.success) {
        toast.success("Đã khôi phục nhiệm vụ quay lại dây chuyền in!");
        router.refresh();
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Xóa nhiệm vụ in này vĩnh viễn?")) return;
    startTransition(async () => {
      const res = await deleteTaskAction(taskId);
      if (res.success) {
        toast.success("Nhiệm vụ đã được xóa khỏi Supabase.");
        router.refresh();
      } else {
        toast.error("Lỗi xóa nhiệm vụ.");
      }
    });
  };

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") return;
    boardBeforeDrag.current = board;
    const task = findTask(board, String(event.active.id));
    setActiveTask(task ?? null);
    setActiveColumnId(findColumnId(board, String(event.active.id)) ?? null);
  }

  function handleDragCancel() {
    if (boardBeforeDrag.current) {
      setBoard(boardBeforeDrag.current);
    }
    boardBeforeDrag.current = null;
    setActiveTask(null);
    setActiveColumnId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.data.current?.type === "column") return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setBoard((currentBoard) => {
      const activeColId = findColumnId(currentBoard, activeId);
      const overColId = findColumnId(currentBoard, overId);

      if (overColId) setActiveColumnId(overColId);
      if (!activeColId || !overColId || activeColId === overColId) return currentBoard;

      const activeItems = currentBoard[activeColId];
      const overItems = currentBoard[overColId];
      const activeIndex = activeItems.findIndex((task) => task.id === activeId);
      if (activeIndex === -1) return currentBoard;

      const overIndex = overItems.findIndex((task) => task.id === overId);
      const nextIndex = overIndex >= 0 ? overIndex : overItems.length;
      const activeItem = activeItems[activeIndex];

      return {
        ...currentBoard,
        [activeColId]: activeItems.filter((task) => task.id !== activeId),
        [overColId]: [...overItems.slice(0, nextIndex), activeItem, ...overItems.slice(nextIndex)],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    const _snapshot = boardBeforeDrag.current;
    boardBeforeDrag.current = null;
    setActiveTask(null);
    setActiveColumnId(null);

    if (activeType === "column" || !over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setBoard((currentBoard) => {
      const activeColumnId = findColumnId(currentBoard, activeId);
      const overColumnId = findColumnId(currentBoard, overId);

      if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
        React.startTransition(async () => {
          const res = await updateTaskColumnAction(activeId, overColumnId);
          if (res.success) {
            toast.success(`Đã cập nhật tiến độ công việc sang cột: ${overColumnId.toUpperCase()}`);
            router.refresh();
          } else {
            toast.error("Không thể lưu thay đổi.");
          }
        });
      }

      if (!activeColumnId || !overColumnId || activeColumnId !== overColumnId) return currentBoard;

      const columnTasks = currentBoard[activeColumnId];
      const activeIndex = columnTasks.findIndex((task) => task.id === activeId);
      const overIndex = columnTasks.findIndex((task) => task.id === overId);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return currentBoard;

      return {
        ...currentBoard,
        [activeColumnId]: arrayMove(columnTasks, activeIndex, overIndex),
      };
    });
  }

  // ĐỒNG BỘ: Tính toán và dọn dẹp kiểu gán tĩnh của allFilteredTasks chuẩn TypeScript
  const allFilteredTasks = React.useMemo(() => {
    return Object.values(processedBoard).flat() as any[];
  }, [processedBoard]);

  return (
    <div className="flex h-[calc(100dvh-var(--dashboard-header-height))] min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <Tabs value={view} onValueChange={setView} className="min-w-0">
          <TabsList className="w-full bg-muted/60">
            <TabsTrigger value="board" className="gap-2 text-xs font-bold">
              <KanbanIcon className="h-4 w-4" /> Bảng kéo thả (Kanban)
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2 text-xs font-bold">
              <List className="h-4 w-4" /> Danh sách dọc
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2 text-xs font-bold">
              <Table2 className="h-4 w-4" /> Bảng bưu cục
            </TabsTrigger>
            {/* ĐÃ THÊM: Tab Kho lưu trữ Notion độc lập */}
            <TabsTrigger
              value="archive"
              className="gap-2 text-xs font-bold text-amber-600 data-[state=active]:bg-amber-50"
            >
              <Archive className="h-4 w-4" /> Kho lưu trữ ({archivedTasksList.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center 2xl:justify-end">
          <InputGroup className="min-w-0 sm:w-64">
            <InputGroupInput
              type="search"
              placeholder="Tìm kiếm nhiệm vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>

          {/* Lọc Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-bold cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" /> Lọc: {filterPriority || "Tất cả"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem onClick={() => setFilterPriority(null)}>Tất cả ưu tiên</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("High")}>Độ ưu tiên: Cao</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Medium")}>Độ ưu tiên: Trung bình</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Low")}>Độ ưu tiên: Thấp</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sắp xếp */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="h-9 text-xs gap-1.5 font-bold cursor-pointer"
          >
            <ArrowUpDown className="h-4 w-4" /> Sắp xếp: {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>

          {/* Hộp thao tác thêm việc và thêm cột */}
          <ButtonGroup className="w-full sm:w-fit">
            <Button
              onClick={() => setOpenAdd(true)}
              className="flex-1 sm:flex-none h-9 text-xs bg-black text-white hover:bg-black/90 font-bold gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Thêm việc
            </Button>
            <ButtonGroupSeparator />
            <Button
              onClick={() => setOpenAddCol(true)}
              variant="outline"
              className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Settings2 className="h-4 w-4" /> Thêm cột
            </Button>
            <ButtonGroupSeparator />
            <Button
              onClick={handleArchiveCompleted}
              variant="outline"
              className="h-9 text-xs font-bold gap-1.5 cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Archive className="h-4 w-4" /> Lưu trữ việc bưu cục
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* RENDER VIEW 1: BẢNG KÉO THẢ KANBAN */}
      {view === "board" && (
        <DndContext
          id="kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden bg-muted/25 px-4 pt-4 pb-4 lg:px-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
            <div className="inline-grid h-full min-w-full grid-cols-[repeat(5,minmax(20rem,1fr))] gap-4">
              <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                {dbColumns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={processedBoard[column.id] || []}
                    onQuickAdd={handleQuickAddTask} // Gắn kết nút cộng nhanh bưu tá
                  />
                ))}
              </SortableContext>
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTask ? <TaskCard task={activeTask} columnId={activeColumnId ?? undefined} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* RENDER VIEW 2: DANH SÁCH DỌC - ĐÃ SỬA THU NHỎ KÍCH THƯỚC NHƯ NOTION */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
          {dbColumns.map((col) => (
            <div key={col.id} className="space-y-1.5">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between border-b pb-1">
                <span>{col.title}</span>
                <Badge variant="outline" className="font-black font-mono text-[9px] h-5 px-1.5">
                  {processedBoard[col.id]?.length || 0} việc
                </Badge>
              </h3>
              <div className="grid gap-2">
                {processedBoard[col.id]?.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/10 transition group"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[9px] font-bold px-1 py-0">
                        {task.team}
                      </Badge>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-red-500 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER VIEW 3: BẢNG SỐ LIỆU */}
      {view === "table" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="border rounded-xl bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left text-slate-500">
              <thead className="text-[11px] text-slate-700 uppercase bg-muted/20 border-b">
                <tr>
                  <th className="px-6 py-3 font-extrabold">Nhiệm vụ</th>
                  <th className="px-6 py-3 font-extrabold">Nhóm phụ trách</th>
                  <th className="px-6 py-3 font-extrabold text-center">Độ ưu tiên</th>
                  <th className="px-6 py-3 font-extrabold text-center">Tiến độ</th>
                  <th className="px-6 py-3 font-extrabold text-center">Thời hạn</th>
                  <th className="px-6 py-3 font-extrabold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allFilteredTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-muted/5 h-12">
                    <td className="px-6 py-3 font-bold text-slate-800">
                      <div>{task.title}</div>
                      <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        {task.description.substring(0, 80)}...
                      </div>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-600">{task.team}</td>
                    <td className="px-6 py-3 text-center">
                      <Badge
                        variant={task.priority === "High" ? "destructive" : "secondary"}
                        className="text-[9px] font-bold"
                      >
                        {task.priority === "High" ? "Cao" : task.priority === "Medium" ? "Trung bình" : "Thấp"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-center font-extrabold text-blue-900 tabular-nums">
                      {task.progress}%
                    </td>
                    <td className="px-6 py-3 text-center font-mono font-medium">{task.dueDate}</td>
                    <td className="px-6 py-3 text-center">
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 4: KHO LƯU TRỮ CHUYÊN DỤNG (Notion-style Archive Bin) */}
      {view === "archive" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="border rounded-xl bg-card overflow-hidden shadow-2xs">
            <div className="p-4 border-b bg-muted/10">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Archive className="h-4 w-4 text-amber-600 animate-pulse" /> Danh sách nhiệm vụ in 3D đã đóng gói lưu
                trữ
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Nơi lưu trữ vết đơn hoàn thành để tránh gây rối mắt dây chuyền chính.
              </p>
            </div>
            <div className="divide-y">
              {archivedTasksList.map((task: any) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-800">{task.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Nút Khôi phục quay lại Kanban */}
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleRestoreTask(task.id)}
                      className="h-7 text-[10px] font-bold gap-1 text-slate-700 cursor-pointer"
                    >
                      Khôi phục
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {archivedTasksList.length === 0 && (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  Kho lưu trữ hiện tại đang trống.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG THÊM CỘT/CÔNG ĐOẠN ĐỘNG */}
      <Dialog open={openAddCol} onOpenChange={setOpenAddCol}>
        <DialogContent className="sm:max-w-[400px] text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold text-slate-800">
              <Settings2 className="h-5 w-5 text-primary" /> Thiết lập công đoạn sản xuất mới
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Tự động thêm một cột cột Kanban mới vào quy trình chế tác.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Tên công đoạn (Tên cột)</Label>
              <Input
                placeholder="VD: Khâu đánh bóng phôi, Đóng thùng..."
                className="h-9 text-xs"
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpenAddCol(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleSaveColumn} disabled={isPending} className="bg-black text-white font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu lên Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG THÊM VIỆC MỚI LÊN SUPABASE */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-[400px] text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold text-slate-800">
              {/* ĐÃ SỬA: Thay thế sang CheckCircle */}
              <CheckCircle className="h-5 w-5 text-primary" /> Thiết lập công việc in mới
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Tự động thêm nhiệm vụ mới vào bảng điều khiển sản xuất của xưởng Boospace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Tiêu đề nhiệm vụ (In 3D/DIY)</Label>
              <Input
                placeholder="VD: In thô phôi rồng đỏ PLA mịn"
                className="h-9 text-xs"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Ghi chú kỹ thuật / Mô tả quy trình</Label>
              <textarea
                placeholder="VD: Thiết kế mật độ Infill 15%, sấy khô phôi thô kỹ trước khi chà mịn..."
                className="w-full min-h-[80px] p-3 text-xs border rounded-lg focus:outline-none"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Bổ sung ô nhập Tag/Nhóm phụ trách tùy chọn */}
            <div className="space-y-1">
              <Label className="font-bold text-[11px] text-slate-700">Nhóm phụ trách (Tags)</Label>
              <Input
                placeholder="VD: Platform, Design, In thô, Gia công..."
                className="h-9 text-xs font-bold text-slate-800"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* BỔ SUNG MỐC THỜI GIAN BẮT ĐẦU & KẾT THÚC ĐỘNG */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Từ ngày
                </Label>
                <Input
                  type="date"
                  className="h-9 text-xs font-semibold"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Đến ngày
                </Label>
                <Input
                  type="date"
                  className="h-9 text-xs font-semibold"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700">Độ ưu tiên</Label>
                <select
                  className="w-full h-9 border rounded-lg px-2 focus:outline-none bg-background text-xs font-semibold"
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                >
                  <option value="High">Cao (High)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="Low">Thấp (Low)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="font-bold text-[11px] text-slate-700">Cột tiến trình sản xuất</Label>
                <select
                  className="w-full h-9 border rounded-lg px-2 focus:outline-none bg-background text-xs font-semibold"
                  value={newCol}
                  onChange={(e) => setNewCol(e.target.value)}
                >
                  {dbColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpenAdd(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleSaveTask} disabled={isPending} className="bg-black text-white font-bold gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu lên Supabase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
