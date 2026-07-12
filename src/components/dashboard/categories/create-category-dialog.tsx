"use client";

import { Loader2, Plus, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { createCategoryAction, uploadCategoryImage } from "@/actions/category.actions";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  categories: any[];
}

export function CreateCategoryDialog({ categories }: Props) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [imageUrl, setImageUrl] = React.useState("");
  const [parentId, setParentId] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // Xử lý tải ảnh trực tiếp lên Supabase Storage qua Action
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadCategoryImage(formData);
      setImageUrl(url);
      toast.success("Tải ảnh danh mục thành công");
    } catch (err: any) {
      toast.error("Lỗi khi tải ảnh: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  async function handleSubmit(formData: FormData): Promise<void> {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const selectedParentId = formData.get("parentId") as string;
    const uploadedImageUrl = formData.get("imageUrl") as string;

    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    startTransition(async () => {
      const res = await createCategoryAction({
        name,
        parent_id: selectedParentId === "none" || !selectedParentId ? null : selectedParentId,
        description: description || null,
        image_url: uploadedImageUrl || null,
      });

      if (res.success) {
        toast.success("Đã thêm danh mục mới");
        setOpen(false);
        // Reset lại state form
        setImageUrl("");
        setParentId(null);
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form action={handleSubmit}>
          {/* TRUYỀN CÁC DỮ LIỆU STATE VÀO FORM QUA INPUT ẨN ĐỂ ĐỒNG BỘ FORM DATA */}
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <input type="hidden" name="parentId" value={parentId || ""} />

          <DialogHeader>
            <DialogTitle>Tạo danh mục mới</DialogTitle>
            <DialogDescription>Nhập tên loại sản phẩm 3D/DIY bạn muốn phân loại.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Tải hình ảnh danh mục */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Hình ảnh danh mục</Label>
              {imageUrl ? (
                <div className="relative h-28 w-28 mx-auto rounded-lg border overflow-hidden group">
                  <Image src={imageUrl} alt="Category" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 w-28 mx-auto border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">{isUploading ? "Đang tải..." : "Chọn ảnh"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || isPending}
                  />
                </label>
              )}
            </div>

            {/* Tên danh mục */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Tên danh mục
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ví dụ: Mô hình nhân vật, Phụ kiện..."
                required
                disabled={isPending}
              />
            </div>

            {/* Danh mục cha (Sử dụng Select UI và gán giá trị vào input ẩn) */}
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Danh mục cha (Tùy chọn)</Label>
              <Select
                value={parentId || "none"}
                onValueChange={(val) => setParentId(val === "none" ? null : val)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (Cấp cao nhất)</SelectItem>
                  {categories
                    ?.filter((c) => !c.parent_id) // Chỉ cho phép chọn danh mục cấp gốc làm cha
                    ?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mô tả ngắn */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Mô tả ngắn
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả cho danh mục này..."
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
            >
              {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending || isUploading ? "Đang xử lý..." : "Lưu danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
