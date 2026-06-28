"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, DollarSign, LayoutGrid, Loader2, Package, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type ProductFormValues, productSchema } from "@/schemas/product.schema";
import { ImageUpload } from "./image-upload";

interface Props {
  initialData?: any;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  onSubmit: (values: ProductFormValues) => Promise<{ success: boolean; error?: string }>;
}

export function ProductForm({ initialData, categories, brands, onSubmit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData
      ? {
          ...initialData,
          category_id: initialData.category_id || null,
          brand_id: initialData.brand_id || null,
          images: initialData.images || [],
        }
      : {
          name: "",
          slug: "",
          price: 0,
          published: true,
          images: [],
          category_id: null,
          brand_id: null,
          description: "",
          sku: "",
          featured: false,
          short_description: null,
          compare_price: null,
          cost_price: null, // Thêm dòng này
          barcode: null, // Thêm dòng này
          weight: null, // Thêm dòng này
          seo_title: null, // Thêm dòng này
          seo_description: null, // Thêm dòng này
        },
  });

  // LOGIC TỰ ĐỘNG TẠO SLUG THEO TÊN
  const nameValue = form.watch("name");
  React.useEffect(() => {
    // Chỉ tự tạo slug nếu là trang Thêm mới (không có initialData)
    if (!isEdit && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Khử dấu tiếng Việt
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, form]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(values);
        if (result.success) {
          toast.success(isEdit ? "Cập nhật thành công" : "Tạo sản phẩm thành công");
          router.push("/dashboard/products");
          router.refresh();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } catch (_err) {
        toast.error("Lỗi hệ thống khi lưu sản phẩm");
      }
    });
  };

  // Hàm xử lý lỗi validation để hiện thông báo cho người dùng
  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error("Vui lòng kiểm tra lại các trường thông tin bị thiếu");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)} className="space-y-8 pb-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" type="button" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">Hình ảnh</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Mô hình 3D..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="mo-hinh-3d" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="BOO-001" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-32" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Giá cả
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compare_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá gốc</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="m-0">Công khai</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel className="m-0">Nổi bật</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" /> Phân loại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                {/* SỬA LỖI BIOME: SỬ DỤNG BRANDS TẠI ĐÂY */}
                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương hiệu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thương hiệu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
