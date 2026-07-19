"use client";

import { ArrowUpRight, Ellipsis } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsKpiStrip({ stats }: { stats: any }) {
  const formatNumber = (val: number) => {
    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`;
  };

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Khách truy cập độc nhất</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold leading-none tracking-tight">{formatNumber(stats.uniqueVisitors)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> 2.8%
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Độc nhất • 4 tuần qua</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Số phiên kết nối</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold leading-none tracking-tight">{formatNumber(stats.totalSessions)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> 2.1%
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Phiên kết nối • 4 tuần qua</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Tổng lượt xem trang</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold leading-none tracking-tight">{formatNumber(stats.totalPageviews)}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> Live
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Lượt xem trang • 4 tuần qua</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Tỷ lệ tương tác</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold leading-none tracking-tight">{stats.engagementRate || "61.4%"}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> 4.2%
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Tỷ lệ tương tác • 4 tuần qua</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Tỷ lệ chuyển đổi đơn</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold text-emerald-600 leading-none tracking-tight">
                {stats.conversionRate}%
              </div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> CR
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Tỷ lệ mua hàng / tổng tài khoản</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
