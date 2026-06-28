"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteProductAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
}

export function DeleteProduct({ id }: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    startTransition(async () => {
      const result = await deleteProductAction(id);

      if (result.success) {
        toast.success("Đã xóa sản phẩm thành công");
      } else {
        toast.error(result.error || "Xóa thất bại");
      }
    });
  }

  return (
    <Button size="icon" variant="destructive" disabled={pending} onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
