import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', amount: 8500 },
  { month: 'Feb', amount: 7200 },
  { month: 'Mar', amount: 9800 },
  { month: 'Apr', amount: 15500 },
  { month: 'May', amount: 12000 },
  { month: 'Jun', amount: 16800 },
  { month: 'Jul', amount: 14200 },
];

const colors = ['#10b981', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#10b981', '#06b6d4'];

export function SpendingOverview() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Spending overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
            ticks={[0, 5000, 10000, 20000]}
          />
          <Bar 
            dataKey="amount" 
            radius={[8, 8, 0, 0]}
            fill="#10b981"
          >
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
