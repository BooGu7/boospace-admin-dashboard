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
            <CardTitle className="font-normal text-sm">Unique Visitors</CardTitle>
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
              <span>Độc nhất • last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Sessions</CardTitle>
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
              <span>Phiên kết nối • last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Pageviews</CardTitle>
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
              <span>Lượt xem trang • last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Engagement Rate</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-bold leading-none tracking-tight">61.4%</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight className="size-3 mr-0.5" /> 4.2%
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              <span>Tỷ lệ tương tác • last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">Conversion Rate</CardTitle>
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
              <span>Tỷ lệ mua hàng / profiles</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
