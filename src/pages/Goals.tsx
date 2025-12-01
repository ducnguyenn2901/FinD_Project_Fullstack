import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { GoalCard } from '../components/goals/GoalCard';
import { CreateGoalDialog } from '../components/goals/CreateGoalDialog';

const mockGoals = [
  {
    id: 1,
    name: 'Tiết kiệm mua laptop',
    target: 25000000,
    current: 19000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  {
    id: 2,
    name: 'Quỹ khẩn cấp',
    target: 15000000,
    current: 8500000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  {
    id: 3,
    name: 'Tiết kiệm đi du lịch',
    target: 10000000,
    current: 3200000,
    startDate: '2024-06-01',
    endDate: '2025-06-01',
  },
];

export function Goals() {
  const [goals, setGoals] = useState(mockGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateGoal = (goalData: any) => {
    const newGoal = {
      id: goals.length + 1,
      ...goalData,
      current: 0,
    };
    setGoals([...goals, newGoal]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1>Mục tiêu tài chính</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo mục tiêu mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <CreateGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
}
