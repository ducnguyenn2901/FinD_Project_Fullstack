import { AlertTriangle } from 'lucide-react';

export function RiskWarning() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="mb-2">Risk warning</h3>
          <p className="text-gray-600">
            Your spending has increased by 35% compared to last month
          </p>
        </div>
      </div>
    </div>
  );
}
