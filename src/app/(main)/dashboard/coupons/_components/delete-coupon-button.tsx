"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { deleteCouponAction } from "@/actions/coupon.actions";
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
import { Button } from "@/components/ui/button";

interface DeleteCouponButtonProps {
  id: string;
  code: string;
}

export function DeleteCouponButton({ id, code }: DeleteCouponButtonProps) {
  const [open, setOpen] = React.useState(false); // Quản lý đóng mở Dialog để tự đóng sau khi xóa xong
  const [pending, startTransition] = React.useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteCouponAction(id);
      if (res.success) {
        toast.success(`Đã xóa mã giảm giá ${code} thành công.`);
        setOpen(false); // TỰ ĐỘNG ĐÓNG HỘP THOẠI NGAY LẬP TỨC
      } else {
        toast.error(res.error || "Không thể xóa mã giảm giá.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {/* Nút thùng rác kích hoạt hộp thoại */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md cursor-pointer shrink-0"
          title="Xóa mã giảm giá"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold">
            <AlertTriangle className="h-5 w-5" /> Xác nhận xóa mã giảm giá?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed pt-2">
            Bạn có chắc chắn muốn xóa mã giảm giá <strong className="text-slate-900 font-mono">{code}</strong>? Hành
            động này không thể hoàn tác. Chương trình khuyến mãi này sẽ bị xóa vĩnh viễn khỏi hệ thống Supabase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Ngăn hành vi tự đóng mặc định để chờ kết quả từ máy chủ
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
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
