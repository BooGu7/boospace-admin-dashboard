"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProductAction } from "@/actions/product.actions";
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

interface DeleteProductProps {
  id: string;
  trigger: React.ReactNode;
}

export function DeleteProduct({ id, trigger }: DeleteProductProps) {
  const [open, setOpen] = useState(false); // Quản lý trạng thái đóng mở Dialog để tự đóng khi xóa xong
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.success) {
        toast.success("Sản phẩm đã được xóa khỏi hệ thống");
        setOpen(false); // TỰ ĐỘNG ĐÓNG HỘP THOẠI NGAY LẬP TỨC
      } else {
        toast.error(result.error || "Không thể xóa sản phẩm");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
