import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Ăn uống', value: 5800000, color: '#3b82f6' },
  { name: 'Mua sắm', value: 4200000, color: '#10b981' },
  { name: 'Giáo dục', value: 3500000, color: '#f59e0b' },
  { name: 'Giải trí', value: 1800000, color: '#ef4444' },
  { name: 'Vay nợ', value: 1500000, color: '#06b6d4' },
];

export function CategoryPieChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Tỷ lệ chi tiêu theo danh mục</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} đ`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}