"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentCustomersTable } from "./recent-customers-table/table";

export function SubscriberOverview({ customers }: { customers: any[] }) {
  return (
    <Card>
      <CardHeader>
        {/* Đã Việt hóa tiêu đề & mô tả hành trình tài khoản */}
        <CardTitle className="leading-none">{customers.length} Khách hàng mới</CardTitle>
        <CardDescription>Danh sách các tài khoản vừa đăng ký trên hệ thống Boospace.</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={customers} />
      </CardContent>
    </Card>
  );
}
