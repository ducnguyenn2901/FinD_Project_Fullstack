import { Target, Calendar } from 'lucide-react';
import { Progress } from '../ui/progress';

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  startDate: string;
  endDate: string;
}

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.current / goal.target) * 100;
  const remaining = goal.target - goal.current;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h3>{goal.name}</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Tiến độ</span>
            <span className="text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Hiện tại:</span>
            <span className="text-green-600">{goal.current.toLocaleString()} đ</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mục tiêu:</span>
            <span>{goal.target.toLocaleString()} đ</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Còn thiếu:</span>
            <span className="text-red-600">{remaining.toLocaleString()} đ</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(goal.startDate).toLocaleDateString('vi-VN')} -{' '}
              {new Date(goal.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
