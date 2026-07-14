"use client";

import { Edit, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCategoryAction, uploadCategoryImage } from "@/actions/category.actions";
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
  category: any;
  categories: any[];
}

export function EditCategoryDialog({ category, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name || "");
  const [parentId, setParentId] = useState<string | null>(category.parent_id || null);
  const [description, setDescription] = useState(category.description || "");
  const [imageUrl, setImageUrl] = useState(category.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadCategoryImage(formData);
      setImageUrl(url);
      toast.success("Cập nhật hình ảnh thành công");
    } catch (err: any) {
      toast.error(`Lỗi khi tải ảnh: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    startTransition(async () => {
      const result = await updateCategoryAction(category.id, {
        name,
        parent_id: parentId === "none" ? null : parentId,
        description,
        image_url: imageUrl || null,
      });

      if (result.success) {
        toast.success("Cập nhật danh mục thành công");
        setOpen(false);
      } else {
        toast.error(result.error || "Không thể cập nhật danh mục");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-black">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết và phân cấp cho danh mục này.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tải ảnh đại diện danh mục */}
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
                  onChange={handleImageUpload}
                  disabled={isUploading || pending}
                />
              </label>
            )}
          </div>

          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-semibold">
              Tên danh mục
            </Label>
            <Input
              id="edit-name"
              placeholder="Ví dụ: Đồ chơi, Decor..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
          </div>

          {/* Danh mục cha (Loại bỏ chính nó c.id !== category.id để tránh vòng lặp cha-con lặp vô tận) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Danh mục cha (Tùy chọn)</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(val) => setParentId(val === "none" ? null : val)}
              disabled={pending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (Cấp cao nhất)</SelectItem>
                {categories
                  .filter((c) => !c.parent_id && c.id !== category.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-semibold">
              Mô tả ngắn
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Nhập mô tả cho danh mục này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pending || isUploading}
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
