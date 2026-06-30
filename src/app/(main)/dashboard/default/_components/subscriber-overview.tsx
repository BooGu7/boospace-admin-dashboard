"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentCustomersTable } from "./recent-customers-table/table";

export function SubscriberOverview({ customers }: { customers: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">{customers.length} Khách hàng mới</CardTitle>
        <CardDescription>Danh sách các tài khoản vừa đăng ký trên hệ thống Boospace.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={customers} />
      </CardContent>
    </Card>
  );
}
