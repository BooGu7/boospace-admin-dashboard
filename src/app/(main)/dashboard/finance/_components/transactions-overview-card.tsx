"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TransactionsOverviewCard({ orders }: { orders: any[] }) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">Giao dịch đơn hàng thực tế</CardTitle>
        <CardDescription>Báo cáo lịch sử dòng tiền đặt hàng đồng bộ từ Supabase.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/15">
            <TableRow>
              <TableHead className="pl-6 font-semibold w-[120px]">Mã đơn</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold text-right">Tổng giá trị</TableHead>
              <TableHead className="font-semibold text-center w-[130px]">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot='table-row']:border-border/50">
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/10 h-14">
                <TableCell className="pl-6 font-bold text-slate-800 font-mono text-xs align-middle">
                  <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                    #{order.code}
                  </Link>
                </TableCell>
                <TableCell className="font-bold text-slate-700 text-xs align-middle">{order.customerName}</TableCell>
                <TableCell className="text-right font-extrabold text-blue-900 dark:text-blue-200 text-sm tabular-nums align-middle">
                  {formatVND(order.total)}
                </TableCell>
                <TableCell className="text-center align-middle">
                  <Badge
                    variant={order.orderStatus === "Delivered" ? "default" : "secondary"}
                    className="text-[10px] font-bold"
                  >
                    {order.orderStatus === "Delivered"
                      ? "Đã giao"
                      : order.orderStatus === "Pending"
                        ? "Chờ duyệt"
                        : "Xác nhận"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">
                  Chưa có giao dịch đơn hàng nào phát sinh trên Supabase.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
