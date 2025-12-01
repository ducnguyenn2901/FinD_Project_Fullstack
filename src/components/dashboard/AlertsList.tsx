import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'warning',
    icon: AlertTriangle,
    title: 'Chi tiêu tháng này tăng 35% so với trung bình',
    description: 'Bạn đã chi tiêu 16.8M đ trong tháng này, cao hơn 4.4M đ so với trung bình 6 tháng trước.',
  },
  {
    id: 2,
    type: 'danger',
    icon: AlertCircle,
    title: 'Dự đoán cuối tháng bạn sẽ âm tiền',
    description: 'Nếu tiếp tục chi tiêu như hiện tại, bạn có thể thiếu hụt khoảng 2.2M đ vào cuối tháng.',
  },
  {
    id: 3,
    type: 'info',
    icon: TrendingUp,
    title: 'Danh mục "Ăn uống" tăng đột biến',
    description: 'Chi tiêu cho ăn uống tháng này cao hơn 58% so với tháng trước.',
  },
];

const typeStyles = {
  warning: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
  danger: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
  info: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
};

export function AlertsList() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6">Cảnh báo và Thông báo</h2>
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const styles = typeStyles[alert.type as keyof typeof typeStyles];
          
          return (
            <div
              key={alert.id}
              className={`${styles.bg} border-l-4 ${styles.border} rounded-lg p-4`}
            >
              <div className="flex gap-3">
                <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
                <div>
                  <h3 className={`${styles.text} mb-1`}>{alert.title}</h3>
                  <p className="text-gray-600">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
