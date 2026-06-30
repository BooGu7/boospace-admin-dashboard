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
    }).format(val);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
        <CardDescription>Danh sách đơn hàng mới nhất đồng bộ từ Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-bold">
                  <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                    #{order.code}
                  </Link>
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="font-semibold">{formatVND(order.total)}</TableCell>
                <TableCell>
                  <Badge variant={order.orderStatus === "Delivered" ? "default" : "secondary"}>
                    {order.orderStatus === "Delivered"
                      ? "Đã giao"
                      : order.orderStatus === "Pending"
                        ? "Chờ duyệt"
                        : "Đang giao"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Chưa có giao dịch nào được ghi nhận.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
