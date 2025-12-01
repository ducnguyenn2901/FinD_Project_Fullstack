import { StatsCards } from '../components/dashboard/StatsCards';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { AlertsList } from '../components/dashboard/AlertsList';

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1>Tổng quan tài chính</h1>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart />
        <CategoryPieChart />
      </div>

      <AlertsList />
    </div>
  );
}
