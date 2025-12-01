import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'T6', amount: 12000000 },
  { month: 'T7', amount: 14200000 },
  { month: 'T8', amount: 11500000 },
  { month: 'T9', amount: 13800000 },
  { month: 'T10', amount: 12400000 },
  { month: 'T11', amount: 16800000 },
];

export function SpendingTrendChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Xu hướng chi tiêu 6 tháng gần đây</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString()} đ`, 'Chi tiêu']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}