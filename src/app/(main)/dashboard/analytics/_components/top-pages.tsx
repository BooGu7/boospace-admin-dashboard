"use client";

import { Ellipsis } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopPagesProps {
  pages: {
    path: string;
    views: string;
    time: string;
    bounce: string;
    name?: string;
    percentage?: number;
  }[];
}

export function TopPages({ pages }: TopPagesProps) {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal text-slate-800">Hiệu suất trang sản phẩm</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <TableHeader className="[&_tr]:border-border/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 font-medium">Đường dẫn trang (URL)</TableHead>
              <TableHead className="h-8 w-24 text-right font-medium">Lượt xem</TableHead>
              <TableHead className="h-8 w-24 text-right font-medium">Avg Time</TableHead>
              <TableHead className="h-8 w-20 text-right font-medium">Bounce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border/50">
            {pages.map((page) => (
              <TableRow className="hover:bg-transparent" key={page.path}>
                <TableCell className="max-w-xs truncate py-4 font-bold text-slate-800">
                  <span className="text-slate-800 block font-bold">{page.name || "Sản phẩm 3D / DIY"}</span>
                  <span className="text-xs text-blue-600 block font-normal mt-0.5">{page.path}</span>
                </TableCell>
                <TableCell className="text-right font-bold text-slate-700 tabular-nums">{page.views}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.time}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{page.bounce}</TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                  Chưa có lưu lượng truy cập sản phẩm thực tế.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
