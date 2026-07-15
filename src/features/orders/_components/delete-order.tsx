"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteOrderAction } from "@/actions/order.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteOrderProps {
  id: string;
  code: string;
  trigger: React.ReactNode;
}

export function DeleteOrder({ id, code, trigger }: DeleteOrderProps) {
  const [open, setOpen] = useState(false); // Quản lý trạng thái đóng mở Dialog để tự đóng khi xóa xong
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (result.success) {
        toast.success(`Đơn hàng #${code} đã được xóa khỏi hệ thống`);
        setOpen(false); // TỰ ĐỘNG ĐÓNG HỘP THOẠI NGAY LẬP TỨC
      } else {
        toast.error(result.error || "Không thể xóa đơn hàng");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            Hành động này không thể hoàn tác. Đơn hàng <strong className="text-slate-900">#{code}</strong> và toàn bộ
            liên kết giao dịch liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống Supabase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Ngăn hành vi mặc định tự đóng để chờ kết quả xóa từ máy chủ
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
