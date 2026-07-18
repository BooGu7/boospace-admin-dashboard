import { columnIds } from "./data";
import type { BoardState, ColumnId, Task } from "./types";

/**
 * KIỂM TRA ĐỊNH DANH CỘT AN TOÀN
 */
export function isColumnId(id: string): id is ColumnId {
  // Ép kiểu mảng hằng số về mảng string chung để đối chiếu an toàn với id: string
  return (columnIds as readonly string[]).includes(id);
}

/**
 * TÌM KIẾM ĐỊNH DANH CỘT CHỨA NHIỆM VỤ IN
 */
export function findColumnId(board: BoardState, id: string): ColumnId | undefined {
  if (isColumnId(id)) return id;

  return (columnIds as readonly string[]).find((columnId) => (board[columnId] || []).some((task) => task.id === id));
}

/**
 * TÌM KIẾM CHI TIẾT NHIỆM VỤ IN TRÊN TOÀN BẢNG
 */
export function findTask(board: BoardState, id: string): Task | undefined {
  for (const columnId of columnIds as readonly string[]) {
    const task = (board[columnId] || []).find((item) => item.id === id);
    if (task) return task;
  }
  return undefined;
}
