"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Cpu, DollarSign, LayoutGrid, Loader2, Package, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { type ProductFormValues, productSchema } from "@/schemas/product.schema";
import { CostCalculatorDialog } from "./cost-calculator-dialog"; // Import máy tính in 3D cao cấp
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

  // Quản lý trạng thái danh sách lựa chọn động cục bộ
  const [localCategories, setLocalCategories] = React.useState(categories);
  const [localBrands, setLocalBrands] = React.useState(brands);

  // Quản lý trạng thái hộp thoại tạo nhanh
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newBrandName, setNewBrandName] = React.useState("");
  const [isCreatingQuick, setIsCreatingQuick] = React.useState(false);

  React.useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  React.useEffect(() => {
    setLocalBrands(brands);
  }, [brands]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData
      ? {
          ...initialData,
          category_id: initialData.category_id || null,
          brand_id: initialData.brand_id || null,
          images: initialData.images || [],
          stock: initialData.stock ?? 0,
          attributes: {
            material: initialData.attributes?.material || "PLA",
            resolution: initialData.attributes?.resolution || "0.15mm",
            infill: initialData.attributes?.infill || "Gyroid Infill",
            waterproof: initialData.attributes?.waterproof || "Kháng nước & bụi mịn",
            safety_factor: initialData.attributes?.safety_factor || "Không mùi sinh học",
            assembly: initialData.attributes?.assembly || "Nguyên khối",
            packaging: initialData.attributes?.packaging || "Hộp giấy Kraft mộc",
            license: initialData.attributes?.license || "CC License",
            scale: initialData.attributes?.scale || "100%",
            print_time: initialData.attributes?.print_time || "0h",
          },
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
          cost_price: null,
          barcode: null,
          weight: null,
          seo_title: null,
          seo_description: null,
          stock: 0,
          attributes: {
            material: "PLA",
            resolution: "0.15mm",
            infill: "Gyroid Infill",
            waterproof: "Kháng nước & bụi mịn",
            safety_factor: "Không mùi sinh học",
            assembly: "Nguyên khối",
            packaging: "Hộp giấy Kraft mộc",
            license: "CC License",
            scale: "100%",
            print_time: "0h",
          },
        },
  });

  const nameValue = form.watch("name");
  React.useEffect(() => {
    if (!isEdit && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, form]);

  const price = form.watch("price") || 0;
  const costPrice = form.watch("cost_price") || 0;
  const margin = React.useMemo(() => {
    if (!price || price <= 0) return 0;
    return Math.round(((price - costPrice) / price) * 100);
  }, [price, costPrice]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(values);
        if (result.success) {
          toast.success(isEdit ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
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

  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
    toast.error("Vui lòng kiểm tra lại các trường thông tin bị thiếu");
  };

  // Tạo nhanh danh mục trực tiếp trên Client
  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingQuick(true);
    try {
      const supabase = createClient();
      const slug = newCategoryName
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName.trim(),
          slug,
          active: true,
        })
        .select("id, name")
        .single();

      if (error) throw error;

      if (data) {
        setLocalCategories((prev) => [...prev, data]);
        form.setValue("category_id", data.id, { shouldValidate: true });
        toast.success(`Đã tạo danh mục "${data.name}" và áp dụng thành công.`);
        setIsCategoryDialogOpen(false);
        setNewCategoryName("");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo nhanh danh mục");
    } finally {
      setIsCreatingQuick(false);
    }
  };

  // Tạo nhanh thương hiệu trực tiếp trên Client
  const handleQuickCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setIsCreatingQuick(true);
    try {
      const supabase = createClient();
      const slug = newBrandName
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data, error } = await supabase
        .from("brands")
        .insert({
          name: newBrandName.trim(),
          slug,
          active: true,
        })
        .select("id, name")
        .single();

      if (error) throw error;

      if (data) {
        setLocalBrands((prev) => [...prev, data]);
        form.setValue("brand_id", data.id, { shouldValidate: true });
        toast.success(`Đã tạo thương hiệu "${data.name}" và áp dụng thành công.`);
        setIsBrandDialogOpen(false);
        setNewBrandName("");
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo nhanh thương hiệu");
    } finally {
      setIsCreatingQuick(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)} className="space-y-8 pb-10">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" type="button" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
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
              {/* Hình ảnh */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hình ảnh sản phẩm</CardTitle>
                  <CardDescription>Tải lên ảnh mô hình sắc nét.</CardDescription>
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

              {/* Thông tin cơ bản */}
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
                        <FormLabel className="font-semibold">Tên sản phẩm</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Tượng phi hành gia decor..." {...field} />
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
                          <FormLabel className="font-semibold">Slug (Đường dẫn)</FormLabel>
                          <FormControl>
                            <Input placeholder="tuong-phi-hanh-gia-decor" {...field} />
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
                          <FormLabel className="font-semibold">Mã SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="BOO-AST-01" {...field} value={field.value || ""} />
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
                        <FormLabel className="font-semibold">Mô tả sản phẩm</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-32"
                            placeholder="Chi tiết sản phẩm..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Giá cả & Tài chính */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Giá cả & Khuyến mãi
                    </CardTitle>
                    <CardDescription className="text-xs">Thiết lập biên lợi nhuận ròng.</CardDescription>
                  </div>

                  <CostCalculatorDialog
                    onApply={(calculated) => {
                      form.setValue("cost_price", calculated.costPrice, {
                        shouldValidate: true,
                      });
                      form.setValue("price", calculated.suggestedPrice, {
                        shouldValidate: true,
                      });
                      form.setValue("compare_price", calculated.comparePrice, {
                        shouldValidate: true,
                      });
                      form.setValue("weight", calculated.weight, {
                        shouldValidate: true,
                      });
                      form.setValue("attributes.material", calculated.material, {
                        shouldValidate: true,
                      });
                      form.setValue("attributes.print_time", calculated.printTime, { shouldValidate: true });
                    }}
                  />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Giá bán sau giảm (VNĐ)</FormLabel>
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
                        <FormLabel className="font-semibold">Giá gốc đề xuất (So sánh)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Giá vốn COGS (VNĐ)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {price > 0 && costPrice > 0 && (
                    <div className="col-span-full rounded-lg bg-muted/60 p-3 text-xs flex justify-between items-center border">
                      <span className="text-muted-foreground">
                        Biên lợi nhuận ròng dự kiến (dựa trên giá sau giảm):
                      </span>
                      <span className="font-extrabold text-green-700 dark:text-green-400 text-sm">
                        {margin}% (~{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(price - costPrice)}
                        )
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* FULL BỘ 3D SPECIFICATION ĐỒNG BỘ ECO-COMMERCE */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> 3D Specifications (Thông số kỹ thuật đầy đủ)
                  </CardTitle>
                  <CardDescription>
                    Cấu hình thông số kỹ thuật in hiển thị trực tiếp trên Boospace Storefront.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="attributes.material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Chất liệu chính</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PLA">Vật liệu sinh học PLA</SelectItem>
                            <SelectItem value="PETG">Vật liệu chịu lực PETG</SelectItem>
                            <SelectItem value="Resin">Nhựa lỏng Resin UV</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.resolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Độ mịn lớp in</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0.12mm">Độ phân giải siêu mịn 0.12mm</SelectItem>
                            <SelectItem value="0.15mm">Độ phân giải siêu mịn 0.15mm</SelectItem>
                            <SelectItem value="0.20mm">Độ phân giải tiêu chuẩn 0.20mm</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.infill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Cấu trúc Infill</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Gyroid Infill">Gyroid Infill (Chịu lực xoắn)</SelectItem>
                            <SelectItem value="Grid Infill">Grid Infill (In nhanh)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.waterproof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Đặc tính kháng nước</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.safety_factor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Hệ số an toàn</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.assembly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Phương thức lắp ráp</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.packaging"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Hình thức đóng gói</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.license"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Bản quyền tác giả</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Cột phụ bên phải */}
            <div className="grid auto-rows-max items-start gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thiết lập hiển thị</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel className="m-0 font-semibold">Công khai</FormLabel>
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
                        <FormLabel className="m-0 font-semibold">Nổi bật</FormLabel>
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
                    <Package className="h-4 w-4" /> Số lượng tồn kho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Số lượng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân loại & Thương hiệu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-semibold">Danh mục</FormLabel>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                            onClick={() => setIsCategoryDialogOpen(true)}
                          >
                            <Plus className="h-3 w-3" /> Tạo mới
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {localCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-semibold">Thương hiệu</FormLabel>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                            onClick={() => setIsBrandDialogOpen(true)}
                          >
                            <Plus className="h-3 w-3" /> Tạo mới
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {localBrands.map((b) => (
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

      {/* ==========================================================
          DIALOG TẠO NHANH DANH MỤC TRỰC TIẾP TRÊN GIAO DIỆN
          ========================================================== */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Tạo nhanh danh mục sản phẩm</DialogTitle>
            <DialogDescription className="text-xs">
              Thêm mới một danh mục phân loại mới, hệ thống tự động đồng bộ liên kết in 3D.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {/* Sửa: Đổi thành thẻ label tiêu chuẩn HTML thay vì FormLabel */}
              <label className="text-xs font-semibold text-slate-700">Tên danh mục mới</label>
              <Input
                placeholder="Ví dụ: Mô hình siêu anh hùng, Linh kiện DIY..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isCreatingQuick}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCategoryDialogOpen(false);
                setNewCategoryName("");
              }}
              disabled={isCreatingQuick}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleQuickCreateCategory} disabled={isCreatingQuick}>
              {isCreatingQuick && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==========================================================
          DIALOG TẠO NHANH THƯƠNG HIỆU TRỰC TIẾP TRÊN GIAO DIỆN
          ========================================================== */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Tạo nhanh thương hiệu</DialogTitle>
            <DialogDescription className="text-xs">
              Thêm một nhà sản xuất hoặc nhãn hiệu gia công in 3D mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {/* Sửa: Đổi thành thẻ label tiêu chuẩn HTML thay vì FormLabel */}
              <label className="text-xs font-semibold text-slate-700">Tên thương hiệu mới</label>
              <Input
                placeholder="Ví dụ: Creality, Bambu Lab, Anycubic..."
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                disabled={isCreatingQuick}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBrandDialogOpen(false);
                setNewBrandName("");
              }}
              disabled={isCreatingQuick}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleQuickCreateBrand} disabled={isCreatingQuick}>
              {isCreatingQuick && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo thương hiệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
