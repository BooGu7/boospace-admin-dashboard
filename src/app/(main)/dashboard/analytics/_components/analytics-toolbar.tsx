"use client";

import { Ellipsis, FileDown, FileUp, RefreshCw, Share2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnalyticsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get("range") || "last-4-weeks";
  const [startVal, setStartVal] = useState(searchParams.get("startDate") || "");
  const [endVal, setEndVal] = useState(searchParams.get("endDate") || "");

  const updateUrl = (range: string, start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    if (range === "custom") {
      if (start) params.set("startDate", start);
      else params.delete("startDate");
      if (end) params.set("endDate", end);
      else params.delete("endDate");
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRangeChange = (value: string) => {
    if (value !== "custom") {
      setStartVal("");
      setEndVal("");
    }
    updateUrl(value, "", "");
  };

  const handleCustomDateApply = (start: string, end: string) => {
    updateUrl("custom", start, end);
  };

  const handleRefresh = () => {
    router.refresh();
    toast.success("Đã làm mới số liệu báo cáo thời gian thực");
  };

  const handleExportData = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              report: "Boospace Analytics Report",
              range: currentRange,
              exportedAt: new Date().toISOString(),
              status: "Success",
            },
            null,
            2,
          ),
        );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `boospace-report-${currentRange}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Đã kết xuất dữ liệu và tải xuống tệp JSON thành công");
    } catch {
      toast.error("Không thể kết xuất dữ liệu báo cáo");
    }
  };

  const handleShareDashboard = () => {
    const fullUrl = `${window.location.origin}${pathname}?range=${currentRange}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toast.success("Đã sao chép liên kết chia sẻ báo cáo đính kèm bộ lọc thời gian!");
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết");
      });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hiện 2 ô nhập ngày khi người dùng chọn mốc custom */}
      {currentRange === "custom" && (
        <div className="flex items-center gap-1.5 shrink-0">
          <Input
            type="date"
            className="h-8 text-xs w-32 px-2"
            value={startVal}
            onChange={(e) => {
              setStartVal(e.target.value);
              handleCustomDateApply(e.target.value, endVal);
            }}
          />
          <span className="text-xs font-semibold text-muted-foreground">đến</span>
          <Input
            type="date"
            className="h-8 text-xs w-32 px-2"
            value={endVal}
            onChange={(e) => {
              setEndVal(e.target.value);
              handleCustomDateApply(startVal, e.target.value);
            }}
          />
        </div>
      )}

      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Chọn thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="last-7-days">7 ngày qua</SelectItem>
            <SelectItem value="last-4-weeks">4 tuần qua</SelectItem>
            <SelectItem value="last-3-months">3 tháng qua</SelectItem>
            <SelectItem value="year-to-date">Từ đầu năm</SelectItem>
            <SelectItem value="custom">Tự chọn mốc</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Thao tác bổ sung">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Hành động báo cáo</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportData}>
              <FileDown className="mr-2 h-4 w-4" />
              Xuất báo cáo JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Bộ nạp ngoài đã sẵn sàng kết nối")}>
              <FileUp className="mr-2 h-4 w-4" />
              Nhập dữ liệu ngoài
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareDashboard}>
              <Share2 className="mr-2 h-4 w-4" />
              Chia sẻ bảng số liệu
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới số liệu
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
