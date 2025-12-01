import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Target, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/expense-details', icon: Receipt, label: 'Chi tiết chi tiêu' },
  { to: '/goals', icon: Target, label: 'Mục tiêu' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
