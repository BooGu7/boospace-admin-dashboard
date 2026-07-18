"use client";

import { flexRender, type Table as TableType } from "@tanstack/react-table";
import { ClipboardList, CreditCard, MapPin, Package, RefreshCw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { getCustomerOrderHistoryAction } from "@/actions/user.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsersTableProps {
  table: TableType<any>;
  openDetail: boolean;
  setOpenDetail: (open: boolean) => void;
  selectedEmail: string;
  selectedName: string;
}

export function UsersTable({ table, openDetail, setOpenDetail, selectedEmail, selectedName }: UsersTableProps) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (openDetail && selectedEmail) {
      setLoadingHistory(true);
      getCustomerOrderHistoryAction(selectedEmail).then((res) => {
        if (res.success && res.data) {
          setHistory(res.data);
        } else {
          toast.error("Không thể tải nhật ký mua hàng.");
        }
        setLoadingHistory(false);
      });
    }
  }, [openDetail, selectedEmail]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-2xs">
        <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
          <TableHeader className="bg-muted/15">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-4 font-extrabold text-slate-800">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/60 hover:bg-muted/5 h-16"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle py-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  Không tìm thấy bất kỳ thành viên nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG MODAL: NHẬT KÝ MUA HÀNG CHI TIẾT (Notion-style Timeline) */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto text-xs">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="h-5 w-5 text-primary" /> Nhật ký mua hàng: {selectedName}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-mono">{selectedEmail}</DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-semibold">
                Đang truy xuất lịch sử đơn từ Supabase...
              </span>
            </div>
          ) : (
            <div className="py-3 space-y-6 relative pl-4 border-l ml-3 border-slate-100">
              {history.map((order) => {
                const isOrderCOD = order.paymentMethod === "COD";
                const paymentLabel = isOrderCOD ? "Tiền mặt (COD)" : `Chuyển khoản VietQR (${order.paymentMethod})`;

                return (
                  <div key={order.id} className="relative">
                    <span className="absolute -left-[27px] top-1 bg-black text-white rounded-full p-1 shadow-sm z-10">
                      <Package className="h-3 w-3" />
                    </span>

                    <div className="space-y-2.5 bg-slate-50/50 border rounded-xl p-4 shadow-2xs">
                      {/* Header đơn */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-800">Đơn hàng #{order.code}</span>
                          <Badge className="bg-blue-50 text-blue-700 text-[9px] font-bold">
                            {order.orderStatus === "Delivered"
                              ? "Đã giao"
                              : order.orderStatus === "Pending"
                                ? "Chờ duyệt"
                                : "Đang giao"}
                          </Badge>
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono font-bold">{order.date}</span>
                      </div>

                      {/* Danh sách vật phẩm in */}
                      <div className="space-y-1.5 py-1">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600 font-medium truncate max-w-[240px]">
                              {item.productName}{" "}
                              <strong className="text-slate-800 font-bold ml-1">x{item.quantity}</strong>
                            </span>
                            <span className="font-mono text-slate-500">{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* ĐỒNG BỘ: Bổ sung Địa chỉ và Phương thức thanh toán vào Nhật ký mua hàng */}
                      <div className="space-y-1 text-[10px] text-slate-600">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span>
                            Địa chỉ giao: <strong className="text-slate-800">{order.address}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>
                            Hình thức: <strong className="text-slate-800">{paymentLabel}</strong>
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Tổng kết tiền mặt */}
                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span className="text-slate-700 text-[10px]">Thực nhận ( payOS / COD ):</span>
                        <span className="text-blue-900 text-xs font-black tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {history.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground italic -ml-4">
                  Thành viên mới đăng ký, chưa phát sinh giao dịch mua hàng nào.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setOpenDetail(false)}
              className="w-full bg-black text-white font-bold h-9 cursor-pointer text-xs"
            >
              Đóng hộp thoại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
