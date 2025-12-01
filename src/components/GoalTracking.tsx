import { Progress } from './ui/progress';

const goals = [
  {
    name: 'Save for laptop',
    current: 19000000,
    target: 25000000,
  },
  {
    name: 'Emergency fund',
    current: 8500000,
    target: 15000000,
  },
  {
    name: 'Vacation savings',
    current: 3200000,
    target: 10000000,
  },
];

export function GoalTracking() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Goal tracking</h2>
      
      <div className="space-y-6">
        {goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">{goal.name}</span>
                <span className="text-gray-900">{goal.current.toLocaleString()} d</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-gray-500 mt-1">
                {progress.toFixed(0)}% of {goal.target.toLocaleString()} d
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
