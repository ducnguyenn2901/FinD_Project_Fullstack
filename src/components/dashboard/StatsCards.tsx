import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

const stats = [
  {
    title: 'Số dư hiện tại',
    value: '14,580,000',
    unit: 'đ',
    icon: Wallet,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Tổng thu nhập tháng này',
    value: '25,000,000',
    unit: 'đ',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Tổng chi tiêu tháng này',
    value: '16,800,000',
    unit: 'đ',
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Số tiền tiết kiệm được',
    value: '8,200,000',
    unit: 'đ',
    icon: PiggyBank,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600">{stat.title}</h3>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-gray-900">
              {stat.value} {stat.unit}
            </p>
          </div>
        );
      })}
    </div>
  );
}
