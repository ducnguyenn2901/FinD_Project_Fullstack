import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Food', value: 35, color: '#3b82f6' },
  { name: 'Shopping', value: 35, color: '#10b981' },
  { name: 'Education', value: 15, color: '#f59e0b' },
  { name: 'Entertainment', value: 3, color: '#ef4444' },
  { name: 'Loan', value: 12, color: '#06b6d4' },
];

export function SpendingBreakdown() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Your spending</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
