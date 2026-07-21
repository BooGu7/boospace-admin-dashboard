"use client";

import {
  AlertTriangle,
  CheckCircle,
  Coins,
  Layers,
  Minus,
  Package,
  Plus,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { saveElectricityRateAction, saveMaterialsAction, updateProductStockAction } from "@/actions/product.actions";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  initialProducts: any[];
  categories: any[];
  initialMaterials: any[];
  initialElectricityRate: number;
}

const formatPriceString = (val: number | string) => {
  if (val === undefined || val === null) return "0";
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

const parsePriceString = (val: string) => {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
};

function getStockBadge(stock: number) {
  if (stock === 0) {
    return <Badge variant="destructive">Hết hàng</Badge>;
  }
  if (stock <= 5) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
        Tồn thấp
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-500/10">
      An toàn
    </Badge>
  );
}

export function InventoryGrid({ initialProducts, categories, initialMaterials, initialElectricityRate }: Props) {
  const [products, setProducts] = React.useState(initialProducts);
  const [materials, setMaterials] = React.useState(initialMaterials);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [stockStatus, setStockStatus] = React.useState("all");

  const [electricityRate, setElectricityRate] = React.useState(initialElectricityRate);
  const [isEditingElectricity, setIsEditingElectricity] = React.useState(false);
  const [tempElectricity, setTempElectricity] = React.useState(initialElectricityRate);

  const [openAddMaterial, setOpenAddMaterial] = React.useState(false);
  const [newMatName, setNewMatName] = React.useState("");
  const [newMatType, setNewMatType] = React.useState("PLA");
  const [newSpoolWeight, setNewSpoolWeight] = React.useState(1000);
  const [newCostPerSpool, setNewCostPerSpool] = React.useState(350000);
  const [newSpoolCount, setNewSpoolCount] = React.useState(1);
  const [newColorName, setNewColorName] = React.useState("Đỏ");
  const [newColorHex, setNewColorHex] = React.useState("#dc2626");

  const [deletingMatId, setDeletingMatId] = React.useState<string | null>(null);

  const [editingStocks, setEditingStocks] = React.useState<Record<string, number>>({});
  const [editingMaterialsData, setEditingMaterialsData] = React.useState<Record<string, any>>({});
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  React.useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  React.useEffect(() => {
    setElectricityRate(initialElectricityRate);
    setTempElectricity(initialElectricityRate);
  }, [initialElectricityRate]);

  const saveElectricityRate = () => {
    startTransition(async () => {
      const res = await saveElectricityRateAction(tempElectricity);
      if (res.success) {
        setElectricityRate(tempElectricity);
        setIsEditingElectricity(false);
        toast.success("Đã cập nhật định mức giá điện lên Supabase!");
      } else {
        toast.error(res.error || "Không thể lưu giá điện lên Supabase");
      }
    });
  };

  const isTemplateProduct = React.useCallback((p: any) => {
    const skuLower = (p.sku || "").toLowerCase();
    const nameLower = (p.name || "").toLowerCase();
    return (
      skuLower === "boo-template-01" ||
      skuLower === "boo-template-02" ||
      skuLower === "boo-template-03" ||
      skuLower.includes("boo-template") ||
      nameLower.includes("boo-template") ||
      nameLower.includes("template 1") ||
      nameLower.includes("template 2") ||
      nameLower.includes("template 3")
    );
  }, []);

  const stats = React.useMemo(() => {
    const activeProducts = products.filter((p) => !isTemplateProduct(p));
    const totalSKUs = activeProducts.length;
    const outOfStock = activeProducts.filter((p) => Number(p.stock || 0) === 0).length;
    const lowStock = activeProducts.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5).length;
    const totalUnits = activeProducts.reduce((sum, p) => sum + Number(p.stock || 0), 0);

    return { totalSKUs, outOfStock, lowStock, totalUnits };
  }, [products, isTemplateProduct]);

  const materialStats = React.useMemo(() => {
    const totalWeight =
      materials.reduce((sum, m) => {
        const count = m.spoolCount !== undefined ? m.spoolCount : m.quantity !== undefined ? m.quantity : 1;
        const weight = m.spoolWeightGrams !== undefined ? m.spoolWeightGrams : 1000;
        return sum + count * weight;
      }, 0) / 1000;

    const lowMaterials = materials.filter((m) => {
      const count = m.spoolCount !== undefined ? m.spoolCount : m.quantity !== undefined ? m.quantity : 1;
      const weight = m.spoolWeightGrams !== undefined ? m.spoolWeightGrams : 1000;
      return count * weight <= 1500;
    }).length;

    return { totalWeight, lowMaterials };
  }, [materials]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      if (isTemplateProduct(product)) return false;

      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === "all" || product.category_id === selectedCategory;

      const currentStock = editingStocks[product.id] ?? Number(product.stock || 0);
      let matchStatus = true;
      if (stockStatus === "out") {
        matchStatus = currentStock === 0;
      } else if (stockStatus === "low") {
        matchStatus = currentStock > 0 && currentStock <= 5;
      } else if (stockStatus === "instock") {
        matchStatus = currentStock > 5;
      }

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, selectedCategory, stockStatus, editingStocks, isTemplateProduct]);

  const adjustStock = (productId: string, currentStock: number, delta: number) => {
    const tempValue = editingStocks[productId] ?? currentStock;
    const newValue = Math.max(0, tempValue + delta);
    setEditingStocks((prev) => ({ ...prev, [productId]: newValue }));
  };

  const handleInputChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    if (!Number.isNaN(num) && num >= 0) {
      setEditingStocks((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const handleMaterialFieldChange = (matId: string, field: string, value: any) => {
    setEditingMaterialsData((prev) => {
      const current = prev[matId] || {};
      return {
        ...prev,
        [matId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const saveStock = (productId: string) => {
    const newValue = editingStocks[productId];
    if (newValue === undefined) return;

    startTransition(async () => {
      const res = await updateProductStockAction(productId, newValue);
      if (res.success) {
        toast.success("Đã cập nhật tồn kho thành công!");
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newValue } : p)));
        setEditingStocks((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      } else {
        toast.error(res.error || "Không thể lưu tồn kho");
      }
    });
  };

  const saveMaterialRow = (matId: string) => {
    const editData = editingMaterialsData[matId];
    if (!editData) return;

    startTransition(async () => {
      const updatedMaterials = materials.map((m) => {
        if (m.id === matId) {
          const costSpool = editData.costPerSpool !== undefined ? editData.costPerSpool : (m.costPerSpool ?? 350000);
          const spoolWeight =
            editData.spoolWeightGrams !== undefined ? editData.spoolWeightGrams : (m.spoolWeightGrams ?? 1000);
          const spoolCount =
            editData.spoolCount !== undefined ? editData.spoolCount : (m.spoolCount ?? m.quantity ?? 1);
          const colorName = editData.colorName !== undefined ? editData.colorName : (m.colorName ?? "Chưa rõ");
          const colorHex = editData.colorHex !== undefined ? editData.colorHex : (m.colorHex ?? "#cccccc");

          const remainingWeight = spoolCount * spoolWeight;
          const costPerKg = Math.round((costSpool / (spoolWeight || 1000)) * 1000);

          return {
            ...m,
            costPerSpool: costSpool,
            spoolWeightGrams: spoolWeight,
            spoolCount: spoolCount,
            quantity: spoolCount,
            colorName: colorName,
            colorHex: colorHex,
            remainingWeightGrams: remainingWeight,
            costPerKg: costPerKg,
          };
        }
        return m;
      });

      const res = await saveMaterialsAction(updatedMaterials);
      if (res.success) {
        toast.success("Đã lưu thông tin vật liệu lên Supabase!");
        setMaterials(updatedMaterials);
        setEditingMaterialsData((prev) => {
          const next = { ...prev };
          delete next[matId];
          return next;
        });
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const handleAddMaterial = () => {
    if (!newMatName.trim()) {
      toast.error("Vui lòng điền tên cuộn nhựa");
      return;
    }

    startTransition(async () => {
      const calculatedCostPerKg = Math.round((newCostPerSpool / (newSpoolWeight || 1000)) * 1000);
      const calculatedRemainingWeight = newSpoolCount * newSpoolWeight;

      const newMat = {
        id: `mat-${Math.random().toString(36).slice(2)}`,
        name: newMatName,
        material: newMatType,
        spoolWeightGrams: newSpoolWeight,
        costPerSpool: newCostPerSpool,
        spoolCount: newSpoolCount,
        quantity: newSpoolCount,
        colorName: newColorName,
        colorHex: newColorHex,
        remainingWeightGrams: calculatedRemainingWeight,
        costPerKg: calculatedCostPerKg,
      };

      const updatedMaterials = [...materials, newMat];
      const res = await saveMaterialsAction(updatedMaterials);

      if (res.success) {
        toast.success("Đã thêm mới cuộn nhựa in lên Supabase!");
        setMaterials(updatedMaterials);
        setOpenAddMaterial(false);
        setNewMatName("");
        setNewMatType("PLA");
        setNewSpoolWeight(1000);
        setNewCostPerSpool(350000);
        setNewSpoolCount(1);
        setNewColorName("Đỏ");
        setNewColorHex("#dc2626");
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi lưu");
      }
    });
  };

  const handleDeleteMaterial = (matId: string) => {
    startTransition(async () => {
      const updatedMaterials = materials.filter((m) => m.id !== matId);
      const res = await saveMaterialsAction(updatedMaterials);

      if (res.success) {
        toast.success("Đã xóa cuộn nhựa khỏi hệ thống");
        setMaterials(updatedMaterials);
        setDeletingMatId(null);
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi xóa");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-muted/70 mb-4">
          <TabsTrigger value="products" className="text-xs">
            Sản phẩm hoàn thiện
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">
            Cuộn nhựa in & Vật liệu hao phí
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tổng phôi in thô (SKU)</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSKUs} loại</div>
                <p className="text-xs text-muted-foreground">Mẫu mô hình & phôi lắp ráp</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock} loại</div>
                <p className="text-xs text-muted-foreground">Cần đẩy tiến độ in bổ sung</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cảnh báo tồn thấp (≤ 5)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.lowStock} loại</div>
                <p className="text-xs text-muted-foreground">Chuẩn bị cạn phôi trưng bày</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tổng số lượng thành phẩm</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{stats.totalUnits.toLocaleString()} cái</div>
                <p className="text-xs text-muted-foreground">Sẵn sàng vận chuyển giao ngay</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm tên phôi hoặc mã SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatus} onValueChange={setStockStatus}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Lọc theo tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tình trạng</SelectItem>
                  <SelectItem value="instock">An toàn (&gt; 5)</SelectItem>
                  <SelectItem value="low">Tồn kho thấp (1 - 5)</SelectItem>
                  <SelectItem value="out">Đã hết hàng (0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/15">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold">Sản phẩm phôi in</TableHead>
                    <TableHead className="font-semibold">Danh mục</TableHead>
                    <TableHead className="font-semibold">Spec vật liệu & in</TableHead>
                    <TableHead className="font-semibold text-center w-[180px]">Điều chỉnh tồn kho</TableHead>
                    <TableHead className="font-semibold text-center">Tình trạng</TableHead>
                    <TableHead className="font-semibold text-right pr-6">Hành động nhanh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isEditing = editingStocks[product.id] !== undefined;
                    const displayStock = editingStocks[product.id] ?? Number(product.stock || 0);

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/20">
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-lg border overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={product.images?.[0] || "https://placehold.co/100x100?text=No+Image"}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="grid gap-0.5 max-w-[220px]">
                              <span className="font-bold text-sm text-slate-800 truncate">{product.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku || "N/A"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm font-medium">
                          {product.categories?.name || "Chưa phân loại"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>
                              Vật liệu:{" "}
                              <strong className="text-slate-700 font-semibold">
                                {product.attributes?.material || "PLA"}
                              </strong>
                            </span>
                            <span>
                              Độ mịn:{" "}
                              <strong className="text-slate-700 font-semibold">
                                {product.attributes?.resolution || "0.2mm"}
                              </strong>
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center align-middle">
                          <div className="flex items-center justify-center gap-1.5 mx-auto">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => adjustStock(product.id, Number(product.stock || 0), -1)}
                              disabled={isPending}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              className="h-7 w-16 text-center font-bold font-mono text-sm p-1 rounded-md"
                              value={displayStock}
                              onChange={(e) => handleInputChange(product.id, e.target.value)}
                              disabled={isPending}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => adjustStock(product.id, Number(product.stock || 0), 1)}
                              disabled={isPending}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="text-center align-middle">{getStockBadge(displayStock)}</TableCell>

                        <TableCell className="text-right pr-6 align-middle">
                          {isEditing ? (
                            <Button
                              size="sm"
                              className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              onClick={() => saveStock(product.id)}
                              disabled={isPending}
                            >
                              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              Lưu nhanh
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Không đổi</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tổng khối lượng nhựa hiện có</CardTitle>
                <Layers className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{`${materialStats.totalWeight.toFixed(1)} kg`}</div>
                <p className="text-xs text-muted-foreground">Tổng trữ lượng khả dụng thực tế</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cuộn nhựa sắp hết (≤ 1.5kg)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{materialStats.lowMaterials} loại</div>
                <p className="text-xs text-muted-foreground">Khối lượng còn lại ở mức báo động</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Định mức Giá Điện Quốc Gia</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                {isEditingElectricity ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={tempElectricity}
                        onChange={(e) => setTempElectricity(Number(e.target.value))}
                        className="h-8 font-bold font-mono text-sm w-28"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">đ/kWh</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-emerald-600 hover:bg-emerald-50 px-2"
                        onClick={saveElectricityRate}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-red-500 hover:bg-red-50 px-2"
                        onClick={() => setIsEditingElectricity(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{electricityRate.toLocaleString()} đ/kWh</div>
                      <p className="text-xs text-muted-foreground">Bộ hạch toán máy tính 3D</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-slate-500 hover:bg-slate-100 px-2"
                      onClick={() => setIsEditingElectricity(true)}
                    >
                      Sửa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-sm text-muted-foreground font-medium">
              Danh sách các cuộn nhựa phục vụ gia công in
            </span>

            <Dialog open={openAddMaterial} onOpenChange={setOpenAddMaterial}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black">
                  <PlusCircle className="h-4 w-4" /> Thêm cuộn nhựa mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Thêm cuộn nhựa in mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin cuộn nhựa nhập kho để máy tính 3D cập nhật dữ liệu tự động.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="mat-name" className="text-xs">
                      Tên cuộn nhựa (Nhãn & màu)
                    </Label>
                    <Input
                      id="mat-name"
                      placeholder="Bambu Lab PLA Matte"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Chất liệu nhựa</Label>
                      <Select value={newMatType} onValueChange={setNewMatType}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="Resin">Resin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mức tịnh cuộn / Grams</Label>
                      <Input
                        type="number"
                        value={newSpoolWeight}
                        onChange={(e) => setNewSpoolWeight(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tên màu sắc</Label>
                      <Input
                        placeholder="Đỏ Basic"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bảng màu</Label>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="text"
                          className="h-9 text-xs"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                        />
                        <input
                          type="color"
                          className="size-9 rounded cursor-pointer border p-0 shrink-0 bg-transparent border-slate-200"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Đơn giá nhập / Cuộn (VND)</Label>
                      <Input
                        type="text"
                        value={formatPriceString(newCostPerSpool)}
                        onChange={(e) => setNewCostPerSpool(parsePriceString(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Số lượng cuộn nhập</Label>
                      <Input
                        type="number"
                        value={newSpoolCount}
                        onChange={(e) => setNewSpoolCount(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAddMaterial(false)} disabled={isPending}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddMaterial}
                    disabled={isPending}
                    className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-bold"
                  >
                    Lưu lên Supabase
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" /> Chi tiết đơn giá & Trọng lượng cuộn nhựa in
              </CardTitle>
              <CardDescription>
                Cập nhật số cuộn và trọng lượng tịnh để tự động xác định tổng khối lượng thực tế khả dụng.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/15">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold">Tên cuộn nhựa in</TableHead>
                    <TableHead className="font-semibold text-center">Chất liệu</TableHead>
                    <TableHead className="font-semibold text-center">Màu sắc</TableHead>
                    <TableHead className="font-semibold text-right">Đơn giá / Cuộn</TableHead>
                    <TableHead className="font-semibold text-right">Mức tịnh / Cuộn</TableHead>
                    <TableHead className="font-semibold text-center w-[120px]">Số lượng cuộn</TableHead>
                    <TableHead className="font-semibold text-right">Tổng khối lượng</TableHead>
                    <TableHead className="font-semibold text-center">Tình trạng</TableHead>
                    <TableHead className="font-semibold text-right pr-6">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((mat) => {
                    const editData = editingMaterialsData[mat.id] || {};
                    const isEditing = editingMaterialsData[mat.id] !== undefined;

                    const displayCostSpool =
                      editData.costPerSpool !== undefined ? editData.costPerSpool : (mat.costPerSpool ?? 350000);
                    const displaySpoolWeight =
                      editData.spoolWeightGrams !== undefined
                        ? editData.spoolWeightGrams
                        : (mat.spoolWeightGrams ?? 1000);
                    const displaySpoolCount =
                      editData.spoolCount !== undefined ? editData.spoolCount : (mat.spoolCount ?? mat.quantity ?? 1);
                    const displayColorName =
                      editData.colorName !== undefined ? editData.colorName : (mat.colorName ?? "Chưa rõ");
                    const displayColorHex =
                      editData.colorHex !== undefined ? editData.colorHex : (mat.colorHex ?? "#cccccc");

                    const displayTotalWeight = displaySpoolCount * displaySpoolWeight;
                    const displayCostSpoolFormatted = formatPriceString(displayCostSpool);

                    return (
                      <TableRow key={mat.id} className="hover:bg-muted/20">
                        <TableCell className="py-4 pl-6 font-bold text-slate-800">{mat.name}</TableCell>

                        <TableCell className="text-center font-semibold">
                          <Badge variant="outline">{mat.material}</Badge>
                        </TableCell>

                        <TableCell className="text-center align-middle">
                          <div className="flex items-center gap-1.5 justify-center min-w-[150px]">
                            <span
                              className="size-3.5 rounded-full border border-slate-200 shadow-xs shrink-0"
                              style={{ backgroundColor: displayColorHex }}
                            />
                            <Input
                              type="text"
                              className="h-7 w-20 text-xs font-semibold p-1"
                              value={displayColorName}
                              onChange={(e) => handleMaterialFieldChange(mat.id, "colorName", e.target.value)}
                            />
                            <input
                              type="color"
                              className="size-6 rounded cursor-pointer border p-0 shrink-0 bg-transparent border-slate-200"
                              value={displayColorHex}
                              onChange={(e) => handleMaterialFieldChange(mat.id, "colorHex", e.target.value)}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Input
                              type="text"
                              className="h-7 w-28 text-right font-bold text-blue-950 font-mono text-xs p-1"
                              value={displayCostSpoolFormatted}
                              onChange={(e) =>
                                handleMaterialFieldChange(mat.id, "costPerSpool", parsePriceString(e.target.value))
                              }
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Input
                              type="number"
                              className="h-7 w-20 text-right font-bold text-slate-800 font-mono text-xs p-1"
                              value={displaySpoolWeight}
                              onChange={(e) =>
                                handleMaterialFieldChange(mat.id, "spoolWeightGrams", Number(e.target.value))
                              }
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              className="h-7 w-16 text-center font-bold text-slate-800 font-mono text-xs p-1"
                              value={displaySpoolCount}
                              onChange={(e) => handleMaterialFieldChange(mat.id, "spoolCount", Number(e.target.value))}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-black text-blue-900 text-xs">
                          {`${displayTotalWeight.toLocaleString()} g`}
                        </TableCell>

                        <TableCell className="text-center align-middle">
                          {displayTotalWeight <= 1500 ? (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
                              Sắp hết
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-500/10">Dồi dào</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right pr-6 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <Button
                                size="sm"
                                className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5"
                                onClick={() => saveMaterialRow(mat.id)}
                                disabled={isPending}
                              >
                                {isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                Lưu
                              </Button>
                            ) : null}

                            <AlertDialog
                              open={deletingMatId === mat.id}
                              onOpenChange={(open) => setDeletingMatId(open ? mat.id : null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                                  disabled={isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa cuộn nhựa?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Cuộn nhựa "{mat.name}" sẽ bị xóa vĩnh viễn khỏi hệ
                                    thống kho.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteMaterial(mat.id);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isPending}
                                  >
                                    {isPending ? (
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
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={`${className} animate-spin`} />;
}
