"use client";

import { Edit, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBrandAction, uploadBrandLogo } from "@/actions/brand.actions";
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
import { Switch } from "@/components/ui/switch";

interface Props {
  brand: any;
}

export function EditBrandDialog({ brand }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(brand.name || "");
  const [website, setWebsite] = useState(brand.website || "");
  const [logoUrl, setLogoUrl] = useState(brand.logo_url || "");
  const [active, setActive] = useState(brand.active !== false);
  const [isUploading, setIsUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadBrandLogo(formData);
      setLogoUrl(url);
      toast.success("Cập nhật logo thành công");
    } catch (err: any) {
      toast.error("Lỗi khi tải ảnh: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    startTransition(async () => {
      const result = await updateBrandAction(brand.id, {
        name,
        logo_url: logoUrl || null,
        website: website || null,
        active,
      });

      if (result.success) {
        toast.success("Cập nhật thương hiệu thành công");
        setOpen(false);
      } else {
        toast.error(result.error || "Không thể cập nhật thương hiệu");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
          <DialogDescription>Cập nhật lại các thông tin chi tiết cho thương hiệu đối tác.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tải Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Logo thương hiệu</Label>
            {logoUrl ? (
              <div className="relative h-24 w-28 mx-auto rounded-lg border overflow-hidden group bg-muted flex items-center justify-center">
                <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 w-28 mx-auto border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">
                  {isUploading ? "Đang tải..." : "Chọn ảnh"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isUploading || pending}
                />
              </label>
            )}
          </div>

          {/* Tên thương hiệu */}
          <div className="space-y-2">
            <Label htmlFor="edit-brand-name" className="text-sm font-semibold">
              Tên thương hiệu
            </Label>
            <Input
              id="edit-brand-name"
              placeholder="Ví dụ: Prusa, Creality, Bambu Lab..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="edit-brand-website" className="text-sm font-semibold">
              Trang chủ đối tác (Tùy chọn)
            </Label>
            <Input
              id="edit-brand-website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={pending}
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Đang hợp tác</Label>
              <p className="text-xs text-muted-foreground">Kích hoạt để hiển thị các sản phẩm thuộc nhãn hiệu này.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} disabled={pending} />
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
