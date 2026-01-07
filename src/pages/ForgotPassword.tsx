import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import api from '../lib/api'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  differenceInDays, 
  getDaysInMonth, 
} from 'date-fns'
import { vi } from 'date-fns/locale'

type Transaction = {
  id?: string
  amount: number
  description: string
  type: 'income' | 'expense'
  category?: string
  date?: string
}

type SavingsGoal = {
  id?: string
  _id?: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  progress?: number
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netSavings: 0
  })

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{
    category: string
    amount: number
    percentage: number
    color: string
  }>>([])

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [monthlySummary, setMonthlySummary] = useState({
    highestSpendingDay: { date: '', amount: 0 },
    highestSpendingCategory: { category: '', amount: 0 },
    averageDailySpending: 0,
    daysRemaining: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const currentMonthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const currentMonthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd')

      // Fetch transactions for current month
      const currentMonthRes = await api.get('/transactions', {
        params: { start: currentMonthStart, end: currentMonthEnd }
      })
      const currentMonthTransactions = currentMonthRes.data || []

      // Fetch recent transactions (5 most recent)
      const recentRes = await api.get('/transactions', { params: { limit: 5 } })
      const recentTransactionsData = recentRes.data || []

      if (recentTransactionsData) {
        setRecentTransactions(recentTransactionsData)
      }

      if (currentMonthTransactions) {
        // Calculate monthly stats
        const monthlyIncome = (currentMonthTransactions as any[])
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const monthlyExpenses = (currentMonthTransactions as any[])
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const netSavings = monthlyIncome - monthlyExpenses

        // Get total balance from all transactions
        const allRes = await api.get('/transactions')
        const allTransactions = allRes.data || []

        const totalBalance = (allTransactions as any[])?.reduce((sum, t) => {
          const amount = t.amount || 0
          return t.type === 'income' ? sum + amount : sum - amount
        }, 0) || 0

        setWalletStats({
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          netSavings
        })

        // Calculate spending by category
        const categorySpending: Record<string, number> = {}
        type TxLocal = { type: string; category?: string; amount?: number; date?: string }
        ;(currentMonthTransactions as TxLocal[])
          .filter((t: TxLocal) => t.type === 'expense' && t.category)
          .forEach((t: TxLocal) => {
            const cat = t.category as string
            categorySpending[cat] = (categorySpending[cat] || 0) + (t.amount || 0)
          })

        const totalSpending = monthlyExpenses
        const categoryColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-gray-500']

        const spendingData = Object.entries(categorySpending).map(([category, amount], index) => ({
          category,
          amount,
          percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
          color: categoryColors[index % categoryColors.length]
        }))

        setSpendingByCategory(spendingData)

        // Calculate monthly summary
        const spendingByDay: Record<string, number> = {}
        const expenseTransactions = (currentMonthTransactions as TxLocal[]).filter((t: TxLocal) => t.type === 'expense')
        
        expenseTransactions.forEach((t: TxLocal) => {
          if (t.date) {
            const day = format(new Date(t.date), 'dd/MM')
            spendingByDay[day] = (spendingByDay[day] || 0) + (t.amount || 0)
          }
        })

        // Find highest spending day
        let highestSpendingDay = { date: '', amount: 0 }
        Object.entries(spendingByDay).forEach(([date, amount]) => {
          if (amount > highestSpendingDay.amount) {
            highestSpendingDay = { date, amount }
          }
        })

        // Find highest spending category
        let highestSpendingCategory = { category: '', amount: 0 }
        Object.entries(categorySpending).forEach(([category, amount]) => {
          if (amount > highestSpendingCategory.amount) {
            highestSpendingCategory = { category, amount }
          }
        })

        // Calculate average daily spending
        const daysPassed = differenceInDays(currentDate, startOfMonth(currentDate)) + 1
        const averageDailySpending = daysPassed > 0 ? monthlyExpenses / daysPassed : 0

        // Calculate days remaining
        const totalDaysInMonth = getDaysInMonth(currentDate)
        const daysRemaining = totalDaysInMonth - daysPassed

        setMonthlySummary({
          highestSpendingDay,
          highestSpendingCategory,
          averageDailySpending,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        })
      }

      // Fetch savings goals
      const goalsRes = await api.get('/goals')
      const goals = goalsRes.data || []

      if (goals) {
        const goalsWithProgress = (goals as any[]).map(goal => ({
          ...goal,
          progress: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
        }))
        setSavingsGoals(goalsWithProgress)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async () => {
    try {
      const newTransaction = {
        amount: 1000000,
        description: 'Thu nhập mới',
        type: 'income' as const,
        category: 'Lương',
        date: new Date().toISOString().split('T')[0]
      }

      await api.post('/transactions', newTransaction)
      fetchDashboardData()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return formatCurrency(amount)
  }

  // calculateTrend removed (unused)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan tài chính của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Thông báo
          </Button>
          <Button onClick={addTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm giao dịch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletStats.totalBalance)}</div>
            <div className="flex items-center text-green-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thu nhập tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(walletStats.monthlyIncome)}</div>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+2.5M so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chi tiêu tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(walletStats.monthlyExpenses)}</div>
            <div className="flex items-center text-red-600 text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-850K so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tiết kiệm ròng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(walletStats.netSavings)}</div>
            <div className="text-sm text-muted-foreground">
              {walletStats.monthlyIncome > 0
                ? `${((walletStats.netSavings / walletStats.monthlyIncome) * 100).toFixed(1)}% thu nhập`
                : '0% thu nhập'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Spending Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Chi tiêu theo danh mục
              </CardTitle>
              <CardDescription>
                Tháng {format(new Date(), 'MM/yyyy', { locale: vi })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingByCategory.length > 0 ? (
                  spendingByCategory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Chưa có dữ liệu chi tiêu tháng này</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Giao dịch gần đây
              </CardTitle>
              <CardDescription>
                {recentTransactions.length} giao dịch mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {transaction.type === 'income' ?
                            <TrendingUp className="h-4 w-4" /> :
                            <TrendingDown className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date
                              ? format(new Date(transaction.date), 'dd/MM/yyyy', { locale: vi })
                              : 'Không rõ ngày'}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Chưa có giao dịch nào</p>
                )}
                <Button variant="outline" className="w-full">
                  Xem tất cả giao dịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Savings Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mục tiêu tiết kiệm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savingsGoals.length > 0 ? (
                savingsGoals.map((goal) => {
                  const progress = goal.target_amount > 0
                    ? Math.round((goal.current_amount / goal.target_amount) * 100)
                    : 0

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <span className="text-sm font-bold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-2">Chưa có mục tiêu tiết kiệm</p>
              )}
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Thêm mục tiêu
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tóm tắt tháng {format(new Date(), 'MM/yyyy', { locale: vi })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ngày chi tiêu nhiều nhất</span>
                <span className="font-medium text-right">
                  {monthlySummary.highestSpendingDay.date ? (
                    <div>
                      <div>{monthlySummary.highestSpendingDay.date}</div>
                      <div className="text-red-600">{formatCurrencyShort(monthlySummary.highestSpendingDay.amount)}</div>
                    </div>
                  ) : (
                    'Chưa có dữ liệu'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Danh mục chi nhiều nhất</span>
                <span className="font-medium text-right">
                  {monthlySummary.highestSpendingCategory.category ? (
                    <div>
                      <div>{monthlySummary.highestSpendingCategory.category}</div>
                      <div className="text-red-600">{formatCurrencyShort(monthlySummary.highestSpendingCategory.amount)}</div>
                    </div>
                  ) : (
                    'Chưa có dữ liệu'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chi tiêu trung bình/ngày</span>
                <span className="font-medium text-red-600">{formatCurrencyShort(monthlySummary.averageDailySpending)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ngày còn lại trong tháng</span>
                <span className="font-medium">{monthlySummary.daysRemaining} ngày</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tổng chi tháng</span>
                  <span className="font-bold text-red-600">{formatCurrency(walletStats.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tổng thu tháng</span>
                  <span className="font-bold text-green-600">{formatCurrency(walletStats.monthlyIncome)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                Quản lý Ví
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Lên lịch thanh toán
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Xem báo cáo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
