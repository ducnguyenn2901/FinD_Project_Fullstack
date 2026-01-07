import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Target,
  PieChart,
  MessageSquare,
} from 'lucide-react'

export function Sidebar() {
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Ví điện tử",
      href: "/wallets",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Giao dịch",
      href: "/transactions",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Đăng ký",
      href: "/subscriptions",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Đầu tư",
      href: "/investments",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: "Phân tích",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Mục tiêu tiết kiệm",
      href: "/savings-goals",
      icon: <Target className="h-5 w-5" />,
    },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold">FinD</span>
        </div>
      </div>
      
      <nav className="px-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* AI Chatbot Link */}
      <div className="mt-8 px-4">
        <NavLink
          to="/chatbot"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-gradient-to-r from-blue-500 to-purple-500 text-white ${
              isActive ? 'ring-2 ring-offset-2 ring-blue-400' : ''
            }`
          }
        >
          <MessageSquare className="h-5 w-5" />
          <span>AI Chatbot</span>
        </NavLink>
      </div>
    </aside>
  )
}
