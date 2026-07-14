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
  XCircle,
  Zap,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { saveMaterialsAction, updateProductStockAction } from "@/actions/product.actions";
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
}

export function InventoryGrid({ initialProducts, categories, initialMaterials }: Props) {
  const [products, setProducts] = React.useState(initialProducts);
  const [materials, setMaterials] = React.useState(initialMaterials);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [stockStatus, setStockStatus] = React.useState("all");

  // Trạng thái thêm mới cuộn nhựa
  const [openAddMaterial, setOpenAddMaterial] = React.useState(false);
  const [newMatName, setNewMatName] = React.useState("");
  const [newMatType, setNewMatType] = React.useState("PLA");
  const [newMatWeight, setNewMatWeight] = React.useState(1000);
  const [newMatCost, setNewMatCost] = React.useState(350000);

  // Trạng thái lưu trữ tạm số lượng thay đổi
  const [editingStocks, setEditingStocks] = React.useState<Record<string, number>>({});
  const [editingMaterials, setEditingMaterials] = React.useState<Record<string, number>>({});
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  React.useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  // THỐNG KÊ CHỈ SỐ KHO SẢN PHẨM
  const stats = React.useMemo(() => {
    const totalSKUs = products.length;
    const outOfStock = products.filter((p) => Number(p.stock || 0) === 0).length;
    const lowStock = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5).length;
    const totalUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

    return { totalSKUs, outOfStock, lowStock, totalUnits };
  }, [products]);

  // THỐNG KÊ CHỈ SỐ VẬT LIỆU
  const materialStats = React.useMemo(() => {
    const totalWeight = materials.reduce((sum, m) => sum + m.remainingWeightGrams, 0) / 1000;
    const lowMaterials = materials.filter((m) => m.remainingWeightGrams <= 1500).length;
    return { totalWeight, lowMaterials };
  }, [materials]);

  // LỌC SẢN PHẨM THEO TÌM KIẾM & BỘ LỌC
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
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
  }, [products, search, selectedCategory, stockStatus, editingStocks]);

  // THAY ĐỔI NHANH TRẠNG THÁI SỐ LƯỢNG TRÊN GIAO DIỆN (CHƯA LƯU DB)
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

  // Tăng/giảm khối lượng nhựa cuộn (Grams)
  const adjustMaterialWeight = (matId: string, currentGrams: number, delta: number) => {
    const tempValue = editingMaterials[matId] ?? currentGrams;
    const newValue = Math.max(0, tempValue + delta);
    setEditingMaterials((prev) => ({ ...prev, [matId]: newValue }));
  };

  const handleMaterialInputChange = (matId: string, val: string) => {
    const num = parseInt(val, 10);
    if (!Number.isNaN(num) && num >= 0) {
      setEditingMaterials((prev) => ({ ...prev, [matId]: num }));
    }
  };

  // LƯU SỐ LƯỢNG TỒN KHO MỚI VÀO SUPABASE
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

  // Lưu nhanh cập nhật cuộn nhựa lên Supabase Settings
  const saveMaterial = (matId: string) => {
    const newValue = editingMaterials[matId];
    if (newValue === undefined) return;

    startTransition(async () => {
      const updatedMaterials = materials.map((m) => (m.id === matId ? { ...m, remainingWeightGrams: newValue } : m));
      const res = await saveMaterialsAction(updatedMaterials);
      if (res.success) {
        toast.success("Đã cập nhật khối lượng vật tư lên Supabase!");
        setMaterials(updatedMaterials);
        setEditingMaterials((prev) => {
          const next = { ...prev };
          delete next[matId];
          return next;
        });
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    });
  };

  // Thêm mới cuộn nhựa lưu vào Supabase
  const handleAddMaterial = () => {
    if (!newMatName.trim()) {
      toast.error("Vui lòng điền tên cuộn nhựa");
      return;
    }

    startTransition(async () => {
      const newMat = {
        id: `mat-${Math.random().toString(36).slice(2)}`,
        name: newMatName,
        material: newMatType,
        remainingWeightGrams: newMatWeight,
        costPerKg: newMatCost,
      };

      const updatedMaterials = [...materials, newMat];
      const res = await saveMaterialsAction(updatedMaterials);

      if (res.success) {
        toast.success("Đã thêm mới cuộn nhựa in lên Supabase!");
        setMaterials(updatedMaterials);
        setOpenAddMaterial(false);
        // Reset form
        setNewMatName("");
        setNewMatType("PLA");
        setNewMatWeight(1000);
        setNewMatCost(350000);
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi lưu");
      }
    });
  };

  const getStockBadge = (stock: number) => {
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
  };

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

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

        {/* ==========================================
            TAB 1: SẢN PHẨM HOÀN THIỆN
            ========================================== */}
        <TabsContent value="products" className="space-y-6">
          {/* Thẻ KPI */}
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

          {/* Công cụ tìm kiếm */}
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

          {/* Bảng sản phẩm */}
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

        {/* ==========================================
            TAB 2: QUẢN LÝ CUỘN NHỰA IN & KHỐI LƯỢNG
            ========================================== */}
        <TabsContent value="materials" className="space-y-6">
          {/* KPI Vật tư */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Tổng khối lượng nhựa hiện có</CardTitle>
                <Layers className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{`${materialStats.totalWeight.toFixed(1)} kg`}</div>
                <p className="text-xs text-muted-foreground">PLA, PETG & nhựa lỏng Resin UV</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cuộn nhựa sắp hết (≤ 1.5kg)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{materialStats.lowMaterials} loại</div>
                <p className="text-xs text-muted-foreground">Cần chuẩn bị mua cuộn mới</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Định mức Giá Điện Quốc Gia</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3.000 đ/kWh</div>
                <p className="text-xs text-muted-foreground">Áp dụng trong bộ hạch toán Máy tính 3D</p>
              </CardContent>
            </Card>
          </div>

          {/* Công cụ thêm vật liệu in mới */}
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-sm text-muted-foreground font-medium">
              Danh sách các cuộn nhựa phục vụ gia công cắt lớp in
            </span>

            {/* Dialog Thêm cuộn nhựa */}
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
                      placeholder="Sợi nhựa PLA Boo Craft Đen"
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
                      <Label className="text-xs">Khối lượng (Grams)</Label>
                      <Input
                        type="number"
                        value={newMatWeight}
                        onChange={(e) => setNewMatWeight(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Đơn giá nhập / kg (VND)</Label>
                    <Input type="number" value={newMatCost} onChange={(e) => setNewMatCost(Number(e.target.value))} />
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

          {/* Bảng chi tiết cuộn nhựa in */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" /> Chi tiết đơn giá & Trọng lượng cuộn nhựa in
              </CardTitle>
              <CardDescription>
                Cập nhật số gram nhựa còn lại sau mỗi lệnh cắt lớp (Slice) để máy tính 3D lấy dữ liệu thực tế.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/15">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold">Tên cuộn nhựa in</TableHead>
                    <TableHead className="font-semibold text-center">Loại chất liệu</TableHead>
                    <TableHead className="font-semibold text-right">Đơn giá nhập / kg</TableHead>
                    <TableHead className="font-semibold text-center w-[220px]">Số lượng nhựa thực tế (Grams)</TableHead>
                    <TableHead className="font-semibold text-center">Tình trạng</TableHead>
                    <TableHead className="font-semibold text-right pr-6">Hành động nhanh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((mat) => {
                    const isEditing = editingMaterials[mat.id] !== undefined;
                    const displayGrams = editingMaterials[mat.id] ?? mat.remainingWeightGrams;

                    return (
                      <TableRow key={mat.id} className="hover:bg-muted/20">
                        <TableCell className="py-4 pl-6 font-bold text-slate-800">{mat.name}</TableCell>

                        <TableCell className="text-center font-semibold">
                          <Badge variant="outline">{mat.material}</Badge>
                        </TableCell>

                        <TableCell className="text-right font-bold text-blue-900">{formatVND(mat.costPerKg)}</TableCell>

                        <TableCell className="text-center align-middle">
                          <div className="flex items-center justify-center gap-1.5 mx-auto">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => adjustMaterialWeight(mat.id, mat.remainingWeightGrams, -100)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              className="h-7 w-20 text-center font-bold font-mono text-sm p-1 rounded-md"
                              value={displayGrams}
                              onChange={(e) => handleMaterialInputChange(mat.id, e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => adjustMaterialWeight(mat.id, mat.remainingWeightGrams, 100)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="text-center align-middle">
                          {displayGrams <= 1500 ? (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
                              Sắp hết
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-500/10">Dồi dào</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right pr-6 align-middle">
                          {isEditing ? (
                            <Button
                              size="sm"
                              className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              onClick={() => saveMaterial(mat.id)}
                            >
                              <Save className="h-3 w-3" />
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
      </Tabs>
    </div>
  );
}

// Hàm bổ trợ render Spinner
function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={`${className} animate-spin`} />;
}
