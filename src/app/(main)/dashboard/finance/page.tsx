import { format } from "date-fns";
import { getFinanceSettingsAction } from "@/actions/finance.actions";
import { getFinancialStats } from "@/lib/repositories/order.repository";
import { BalanceDistributionCard } from "./_components/balance-distribution-card";
import { FinanceNotification } from "./_components/finance-notification";
import { FinanceToolbarActions } from "./_components/finance-toolbar-actions"; // Chứa nút Xuất JSON và Modal Cấu hình thật
import { IncomeBreakdown } from "./_components/income-breakdown";
import { OverviewKpis } from "./_components/overview-kpis";
import { QuickActions } from "./_components/quick-actions";
import { TransactionsOverviewCard } from "./_components/transactions-overview-card";
import { UpcomingTransactions } from "./_components/upcoming-transactions";
import { Wallet } from "./_components/wallet";

export const revalidate = 0; // Đảm bảo luôn làm mới dữ liệu khi F5

export default async function Page() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  // Nạp dữ liệu tài chính thực tế và cài đặt ví/chi phí từ Supabase song song
  const [stats, financeSettings] = await Promise.all([getFinancialStats(), getFinanceSettingsAction()]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Tài chính xưởng in</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        {/* CỘT ACTIONS: XUẤT FILE JSON VÀ MODAL SỬA ĐƠN GIÁ/VÍ TRÊN SUPABASE */}
        <FinanceToolbarActions stats={stats} settings={financeSettings} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <OverviewKpis stats={stats} />
          </div>

          <div className="flex flex-col gap-4 xl:col-span-6">
            <IncomeBreakdown data={stats.categoryBreakdown} totalRevenue={stats.grossRevenue} />
            <FinanceNotification stats={stats} settings={financeSettings} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <TransactionsOverviewCard orders={stats.recentOrders} />
          </div>
          <div className="xl:col-span-5">
            <BalanceDistributionCard stats={stats} settings={financeSettings} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <Wallet grossRevenue={stats.grossRevenue} settings={financeSettings} />
          </div>
          <div className="xl:col-span-4">
            <UpcomingTransactions settings={financeSettings} />
          </div>
          <div className="xl:col-span-4">
            <QuickActions settings={financeSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
