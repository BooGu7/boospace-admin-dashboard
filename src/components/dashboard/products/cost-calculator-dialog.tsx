"use client";

import { Calculator, Cpu, DollarSign, Layers, Percent, Sparkles, Truck, Wrench, Zap } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { getMaterialsAction } from "@/actions/product.actions";
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
import { Separator } from "@/components/ui/separator";

export function CostCalculatorDialog({
  onApply,
}: {
  onApply: (calculated: {
    costPrice: number;
    suggestedPrice: number;
    comparePrice: number;
    weight: number;
    printTime: string;
    material: string;
  }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [dbMaterials, setDbMaterials] = React.useState<any[]>([]);

  // 1. CHI PHÍ VẬT LIỆU
  const [selectedMatId, setSelectedMatId] = React.useState("mat-1");
  const [weight, setWeight] = React.useState(150);
  const [failureRate, setFailureRate] = React.useState(10);

  // 2. CHI PHÍ ĐIỆN & KHẤU HAO (VNĐ/kWh)
  const [printHours, setPrintHours] = React.useState(8);
  const [machineWatts, setMachineWatts] = React.useState(250);
  const [electricityTariff, setElectricityTariff] = React.useState(3000);
  const [depreciationPerHour, setDepreciationPerHour] = React.useState(5000);

  // 3. CHI PHÍ NHÂN CÔNG GIA CÔNG
  const [finishingHours, setFinishingHours] = React.useState(1);
  const [laborRatePerHour, setLaborRatePerHour] = React.useState(50000);

  // 4. CHI PHÍ KHÁC & ĐÓNG GÓI
  const [packagingCost, setPackagingCost] = React.useState(15000);
  const [otherOverhead, setOtherOverhead] = React.useState(10000);
  const [platformFeePercent, _setPlatformFeeFeePercent] = React.useState(8);
  const [marketingFeePercent, _setMarketingFeePercent] = React.useState(5);
  const [vatPercent, _setVatPercent] = React.useState(8);

  // 5. BIÊN LỢI NHUẬN MONG MUỐN & GIẢM GIÁ KHUYẾN MÃI (Mặc định: biên 20%)
  const [targetMargin, setTargetMargin] = React.useState(20);
  const [promoDiscountPercent, setPromoDiscountPercent] = React.useState(10); // Khuyến mãi % giảm giá

  // Tải danh sách vật liệu thời gian thực từ Supabase để tính toán
  React.useEffect(() => {
    if (open) {
      getMaterialsAction().then((data) => {
        setDbMaterials(data);
        if (data.length > 0) setSelectedMatId(data[0].id);
      });
    }
  }, [open]);

  const calculations = React.useMemo(() => {
    const selectedMat = dbMaterials.find((m) => m.id === selectedMatId);
    const pricePerKg = selectedMat ? selectedMat.costPerKg : 350000;
    const materialType = selectedMat ? selectedMat.material : "PLA";

    // A. Tiền nhựa thực tế
    const materialWeightWithFailure = weight * (1 + failureRate / 100);
    const materialCost = Math.round((materialWeightWithFailure / 1000) * pricePerKg);

    // B. Tiền điện thực tế tiêu thụ
    const kwhConsumed = (machineWatts * printHours) / 1000;
    const powerCost = Math.round(kwhConsumed * electricityTariff);
    const depreciationCost = Math.round(printHours * depreciationPerHour);
    const totalMachineCost = powerCost + depreciationCost;

    // C. Tiền công gia công nguội
    const laborCost = Math.round(finishingHours * laborRatePerHour);

    // D. TỔNG GIÁ VỐN SẢN XUẤT (COGS)
    const totalCostPrice = materialCost + totalMachineCost + laborCost + packagingCost + otherOverhead;

    // E. Giá bán gốc đề xuất (So sánh) dựa trên Biên lợi nhuận mong muốn
    const baseComparePrice = Math.round(totalCostPrice / (1 - targetMargin / 100));
    const totalFeeRate = (platformFeePercent + marketingFeePercent + vatPercent) / 100;
    const comparePrice = Math.round(baseComparePrice * (1 + totalFeeRate));

    // F. Giá bán đề xuất sau khi áp dụng Khuyến mãi giảm giá
    const priceAfterDiscount = Math.round(comparePrice * (1 - promoDiscountPercent / 100));

    return {
      materialCost,
      powerCost,
      depreciationCost,
      totalMachineCost,
      laborCost,
      totalCostPrice,
      comparePrice,
      suggestedRetailPrice: priceAfterDiscount,
      materialType,
    };
  }, [
    dbMaterials,
    selectedMatId,
    weight,
    failureRate,
    printHours,
    machineWatts,
    electricityTariff,
    depreciationPerHour,
    finishingHours,
    laborRatePerHour,
    packagingCost,
    otherOverhead,
    platformFeePercent,
    marketingFeePercent,
    vatPercent,
    targetMargin,
    promoDiscountPercent,
  ]);

  const handleApply = () => {
    onApply({
      costPrice: calculations.totalCostPrice,
      suggestedPrice: calculations.suggestedRetailPrice,
      comparePrice: calculations.comparePrice,
      weight,
      printTime: `${printHours}h`,
      material: calculations.materialType,
    });
    setOpen(false);
    toast.success("Đã áp dụng định giá & chương trình khuyến mãi!");
  };

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-primary/40 text-primary hover:bg-primary/5"
        >
          <Calculator className="h-4 w-4" /> Tính giá in 3D tự động
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse" />
            Máy tính định giá & Cấu hình khuyến mãi
          </DialogTitle>
          <DialogDescription>
            Tự động lấy đơn giá cuộn nhựa thực tế từ kho vật tư Supabase để chiết tính giá vốn chuẩn xác nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 py-2">
          {/* CỘT NHẬP LIỆU BÊN TRÁI */}
          <div className="space-y-4 pr-2 border-r">
            {/* Mục 1: Chi phí vật liệu in */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> 1. Chi phí vật liệu & Phôi thực tế
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs font-semibold">Chọn cuộn nhựa sử dụng</Label>
                  <Select value={selectedMatId} onValueChange={setSelectedMatId}>
                    <SelectTrigger className="h-8 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dbMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({formatVND(m.costPerKg)}/kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs font-semibold">Khối lượng chi tiết in (Grams)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs flex justify-between font-semibold">
                    <span>Tỷ lệ hao hụt / in hỏng</span>
                    <span className="font-bold text-red-600">{failureRate}%</span>
                  </Label>
                  <Input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={failureRate}
                    onChange={(e) => setFailureRate(Number(e.target.value))}
                    className="h-4"
                  />
                </div>
              </div>
            </div>

            {/* Mục 2: Chi phí điện năng (VNĐ/kWh) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> 2. Chi phí máy in & Điện nhà nước
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Công suất máy (Watts)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={machineWatts}
                    onChange={(e) => setMachineWatts(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Giá điện (đ/kWh)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={electricityTariff}
                    onChange={(e) => setElectricityTariff(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Thời gian in (Giờ)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={printHours}
                    onChange={(e) => setPrintHours(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Khấu hao máy (đ/giờ)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={depreciationPerHour}
                    onChange={(e) => setDepreciationPerHour(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Mục 3: Chi phí nhân công */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" /> 3. Chi phí nhân công gia công
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Giờ xử lý (Chà/Sơn)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    className="h-8 text-xs font-mono font-bold"
                    value={finishingHours}
                    onChange={(e) => setFinishingHours(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Lương thợ (đ/giờ)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={laborRatePerHour}
                    onChange={(e) => setLaborRatePerHour(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Mục 4: Chi phí khác */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> 4. Đóng gói & Phát sinh khác
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Hộp carton & xốp (đ)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phí dự phòng khác (đ)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs font-mono font-bold"
                    value={otherOverhead}
                    onChange={(e) => setOtherOverhead(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT HIỂN THỊ KẾT QUẢ BÊN PHẢI */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* Lợi nhuận kỳ vọng */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" /> 5. Mục tiêu kinh doanh
              </h4>
              <div className="space-y-1.5 rounded-lg border p-3 bg-muted/20">
                <Label className="text-xs flex justify-between font-semibold">
                  <span>Biên lợi nhuận mong muốn</span>
                  <span className="font-extrabold text-blue-700 dark:text-blue-300 text-sm">{targetMargin}%</span>
                </Label>
                <Input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="h-4 mt-1.5"
                />
              </div>
            </div>

            {/* Cấu hình chương trình Khuyến mãi giảm giá trực tiếp */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" /> 6. Chương trình Giảm giá (%)
              </h4>
              <div className="space-y-1.5 rounded-lg border p-3 bg-red-500/5 border-red-500/20">
                <Label className="text-xs flex justify-between font-semibold text-red-600">
                  <span>Chiết khấu giảm giá bán sản phẩm</span>
                  <span className="font-extrabold text-sm">{promoDiscountPercent}%</span>
                </Label>
                <Input
                  type="range"
                  min={0}
                  max={60}
                  step={2}
                  value={promoDiscountPercent}
                  onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                  className="h-4 mt-1.5"
                />
              </div>
            </div>

            {/* Bảng chiết tính chi tiết đầu ra */}
            <div className="space-y-3 rounded-xl border p-4 bg-slate-50 dark:bg-slate-900 border-primary/20">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Chiết tính giá vốn sản xuất</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Chi phí sợi nhựa/Resin:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatVND(calculations.materialCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chi phí tiền điện máy:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatVND(calculations.powerCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Khấu hao thiết bị in:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatVND(calculations.depreciationCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chi phí nhân công nguội:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatVND(calculations.laborCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phát sinh khác & Đóng gói:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatVND(packagingCost + otherOverhead)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">TỔNG GIÁ VỐN (COGS):</span>
                  <span className="font-black text-blue-900 dark:text-blue-300">
                    {formatVND(calculations.totalCostPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* GIÁ RETAIL ĐỀ XUẤT */}
            <div className="rounded-xl bg-primary/5 border border-primary/30 p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Giá gốc đề xuất (So sánh):</span>
                <span className="font-bold text-slate-600 line-through">{formatVND(calculations.comparePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold border-t pt-2">
                <span className="text-primary flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" /> Giá bán sau giảm:
                </span>
                <span className="text-lg text-emerald-600 dark:text-emerald-400 font-black">
                  {formatVND(calculations.suggestedRetailPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-bold gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Áp dụng giá vào sản phẩm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
