"use client";

import { Loader2, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { createBrandAction } from "@/actions/brand.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateBrandDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;

    startTransition(async () => {
      const res = await createBrandAction(name, logoUrl);
      if (res.success) {
        toast.success("Đã thêm thương hiệu thành công");
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Thêm Brand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm thương hiệu mới</DialogTitle>
            <DialogDescription>Nhập thông tin hãng sản xuất sản phẩm 3D/DIY.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên thương hiệu</Label>
              <Input name="name" placeholder="Ví dụ: Creality, Prusa, Boo Studio..." required />
            </div>
            <div className="grid gap-2">
              <Label>URL Logo (Tùy chọn)</Label>
              <Input name="logoUrl" placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thương hiệu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
