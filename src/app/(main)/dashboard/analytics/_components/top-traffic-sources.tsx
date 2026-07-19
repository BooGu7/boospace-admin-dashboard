"use client";

import { Ellipsis } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TrafficSourceDatum = {
  label: string;
  source: string;
  visitors: number;
};

interface TopTrafficSourcesProps {
  sources: TrafficSourceDatum[];
  campaigns: TrafficSourceDatum[];
  referrers: TrafficSourceDatum[];
}

// Thành phần dòng hiển thị Progress Bar tối ưu giao diện chống vỡ chữ
function TrafficSourceRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-700 truncate max-w-[280px]" title={label}>
          {label}
        </span>
        <span className="font-mono text-slate-900 tabular-nums">{value} người</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function TopTrafficSources({ sources, campaigns, referrers }: TopTrafficSourcesProps) {
  // Lấy giá trị lớn nhất của từng nhóm để tính tỷ lệ phần trăm Progress Bar
  const maxSource = Math.max(...(sources || []).map((s) => s.visitors), 0);
  const maxCampaign = Math.max(...(campaigns || []).map((c) => c.visitors), 0);
  const maxReferrer = Math.max(...(referrers || []).map((r) => r.visitors), 0);

  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal text-slate-800">Nguồn truy cập</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0 pt-0">
        <Tabs defaultValue="sources" className="flex flex-col gap-3">
          <TabsList className="w-full justify-start border-b px-2.5" variant="line">
            <TabsTrigger className="flex-none font-normal" value="sources">
              Nguồn truy cập
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="campaigns">
              Chiến dịch
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="referrers">
              Trang giới thiệu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="px-4 space-y-4">
            {(sources || []).map((item) => (
              <TrafficSourceRow key={item.source} label={item.source} value={item.visitors} max={maxSource} />
            ))}
            {(!sources || sources.length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-xs">
                Chưa có dữ liệu nguồn truy cập thực tế.
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="px-4 space-y-4">
            {(campaigns || []).map((item) => (
              <TrafficSourceRow key={item.source} label={item.source} value={item.visitors} max={maxCampaign} />
            ))}
            {(!campaigns || campaigns.length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-xs">Chưa có dữ liệu chiến dịch thực tế.</div>
            )}
          </TabsContent>

          <TabsContent value="referrers" className="px-4 space-y-4">
            {(referrers || []).map((item) => (
              <TrafficSourceRow key={item.source} label={item.source} value={item.visitors} max={maxReferrer} />
            ))}
            {(!referrers || referrers.length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-xs">
                Chưa có dữ liệu trang giới thiệu thực tế.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
