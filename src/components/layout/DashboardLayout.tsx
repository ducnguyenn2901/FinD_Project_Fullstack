import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ModeToggle } from '../mode-toggle'
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Target,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  User,
  Sparkles
} from 'lucide-react'
import { cn } from '../ui/utils'
import Chatbot from '../ai/Chatbot'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }


  const navigationItems = [
    { title: "Tổng quan", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Ví điện tử", href: "/wallets", icon: <Wallet className="h-5 w-5" /> },
    { title: "Giao dịch", href: "/transactions", icon: <CreditCard className="h-5 w-5" /> },
    { title: "Đăng ký", href: "/subscriptions", icon: <Calendar className="h-5 w-5" /> },
    { title: "Đầu tư", href: "/investments", icon: <TrendingUp className="h-5 w-5" /> },
    { title: "Phân tích", href: "/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Mục tiêu tiết kiệm", href: "/goals", icon: <Target className="h-5 w-5" /> },
    { title: "AI Chatbot", href: "/chatbot", icon: <Sparkles className="h-5 w-5" /> },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserInitials = () => {
    const name = user?.name || ''
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebar 
            navigationItems={navigationItems} 
            currentPath={location.pathname}
            onNavigate={() => setMobileOpen(false)}
            user={user}
            onSignOut={handleSignOut}
            formatCurrency={formatCurrency}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <DesktopSidebar 
          navigationItems={navigationItems} 
          currentPath={location.pathname}
          user={user}
          onSignOut={handleSignOut}
          formatCurrency={formatCurrency}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">
              {navigationItems.find(item => item.href === location.pathname)?.title || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600"></span>
            </Button>
            
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'Người dùng'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Trợ giúp</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
        <Chatbot />
      </main>
    </div>
  )
}

// Mobile Sidebar Component
type NavigationItem = { title: string; href: string; icon: React.ReactNode }
type UserInfo = {
  email?: string
  total_assets?: number
  monthly_income?: number
  monthly_expense?: number
  name?: string
  user_metadata?: { name?: string; avatar_url?: string }
} | null

const MobileSidebar = ({ 
  navigationItems, 
  currentPath, 
  onNavigate,
  user,
  onSignOut,
  formatCurrency
}: {
  navigationItems: NavigationItem[]
  currentPath: string
  onNavigate: () => void
  user: UserInfo
  onSignOut: () => void
  formatCurrency: (amount: number) => string
}) => {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white">D</span>
          </div>
          <span className="text-xl font-bold">FinD</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
                onClick={() => {
                  navigate(item.href)
                  onNavigate()
                }}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Button>
            )
          })}
        </nav>
        
        <Separator className="my-4" />
        
        {/* Quick Stats */}
        <div className="px-3 py-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Tổng quan</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng tài sản</span>
              <span className="font-semibold">{formatCurrency(user?.total_assets || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Thu nhập tháng</span>
              <span className="font-semibold text-green-600">{formatCurrency(user?.monthly_income || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Chi tiêu tháng</span>
              <span className="font-semibold text-red-600">{formatCurrency(user?.monthly_expense || 0)}</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                <Avatar>
              <AvatarFallback>
                {(user?.name || '')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.name || 'Người dùng'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const DesktopSidebar = ({ 
  navigationItems, 
  currentPath,
  user,
  onSignOut,
  formatCurrency
}: {
  navigationItems: NavigationItem[]
  currentPath: string
  user: UserInfo
  onSignOut: () => void
  formatCurrency: (amount: number) => string
}) => {
  const navigate = useNavigate()
  
  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white">D</span>
          </div>
          <span className="text-xl font-bold">FinD</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Button>
            )
          })}
        </nav>
        
        <Separator className="my-4" />
        
        {/* Quick Stats */}
        <div className="px-3 py-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Tổng quan</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng tài sản</span>
              <span className="font-semibold">{formatCurrency(user?.total_assets || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Thu nhập tháng</span>
              <span className="font-semibold text-green-600">{formatCurrency(user?.monthly_income || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Chi tiêu tháng</span>
              <span className="font-semibold text-red-600">{formatCurrency(user?.monthly_expense || 0)}</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback>
                  {(user?.name || '')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || 'Người dùng'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || 'Người dùng'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export default DashboardLayout
