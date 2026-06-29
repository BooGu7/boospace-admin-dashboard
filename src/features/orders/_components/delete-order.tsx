"use client";

import { Loader2, Trash } from "lucide-react";
import { useTransition } from "react";
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
  onSuccess?: () => void; // Thêm callback
}

export function DeleteOrder({ id, onSuccess }: DeleteOrderProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (result.success) {
        toast.success("Đơn hàng đã được xóa khỏi hệ thống");
        if (onSuccess) onSuccess(); // Gọi làm mới UI
      } else {
        toast.error(result.error || "Không thể xóa đơn hàng");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <span className="flex items-center text-red-600 cursor-pointer w-full">
          <Trash className="mr-2 h-4 w-4" /> Xóa đơn hàng
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Đơn hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
