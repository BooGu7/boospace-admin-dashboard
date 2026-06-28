"use client";

import { UploadCloud, X } from "lucide-react";

import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import { uploadProductImage } from "@/actions/product.actions";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUrls = [...value];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const url = await uploadProductImage(formData);
        newUrls.push(url);
      }
      onChange(newUrls);
      toast.success("Đã tải ảnh lên thành công");
    } catch (_error) {
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden border">
            <Image src={url} alt="Product image" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition">
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-2">{isUploading ? "Đang tải..." : "Thêm ảnh"}</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
            disabled={isUploading}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
}
