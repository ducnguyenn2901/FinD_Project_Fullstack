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
  Plus,
  Loader2
} from 'lucide-react'
import api from '../lib/api'
import { format, startOfMonth, endOfMonth, differenceInDays, getDaysInMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
type Transaction = {
  id?: string
  amount: number
  description: string
  type: 'income' | 'expense'
  category?: string
  date: string
  wallet?: string
}

type Goal = {
  id?: string
  _id?: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  progress?: number
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    previousMonthBalance: 0,
    monthlyIncome: 0,
    previousMonthIncome: 0,
    monthlyExpenses: 0,
    previousMonthExpenses: 0,
    netSavings: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [spendingByCategory, setSpendingByCategory] = useState<Array<{
    category: string
    amount: number
    percentage: number
    color: string
  }>>([])
  const [savingsGoals, setSavingsGoals] = useState<Goal[]>([])
  const [monthlySummary, setMonthlySummary] = useState({
    highestSpendingDay: { date: '', amount: 0 },
    highestSpendingCategory: { category: '', amount: 0 },
    averageDailySpending: 0,
    daysRemaining: 0
  })
  const [range, setRange] = useState<'7d' | '30d'>('30d')
  const [dailySeries, setDailySeries] = useState<{
    labels: string[]
    income: number[]
    expense: number[]
  }>({ labels: [], income: [], expense: [] })
  // State for add-transaction modal/inputs (temporarily removed unused states to satisfy type checks)
  useEffect(() => {
    fetchDashboardData()
  }, [])
  const extractArray = (res: unknown) => {
    const data = (res as { data?: unknown })?.data
    if (Array.isArray(data)) return data
    const nested = (data as { data?: unknown })?.data
    if (Array.isArray(nested)) return nested
    const items = (data as { items?: unknown })?.items
    if (Array.isArray(items)) return items
    return []
  }
  const normalizeType = (t: unknown) => {
    const s = String(t ?? '').toLowerCase()
    if (s === 'income' || s === 'expense') return s
    if (s === 'in' || s === 'credit' || s === '1') return 'income'
    return 'expense'
  }
  const normalizeTransaction = (t: Record<string, unknown>): Transaction => ({
    id: (t['id'] ?? t['_id'] ?? t['transactionId'] ?? t['uuid']) as string | undefined,
    amount: Number(t['amount'] ?? 0),
    description: (t['description'] ?? '') as string,
    type: normalizeType(t['type']) as 'income' | 'expense',
    category: (t['category'] ?? t['category_name'] ?? '') as string,
    date: (t['date'] ?? t['transactionDate'] ?? t['created_at'] ?? t['createdAt'] ?? new Date().toISOString()) as string,
    wallet: (t['wallet'] ?? '') as string
  })
  const normalizeGoal = (g: Record<string, unknown>): Goal => {
    const target = Number(g['target_amount'] ?? g['targetAmount'] ?? 0)
    const current = Number(g['current_amount'] ?? g['currentAmount'] ?? 0)
    return {
      id: (g['id'] ?? g['_id'] ?? g['goalId']) as string | undefined,
      name: (g['name'] ?? '') as string,
      target_amount: target,
      current_amount: current,
      deadline: (g['deadline'] ?? g['endDate'] ?? null) as string | null
    }
  }
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const currentMonthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const currentMonthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      const currentMonthTransactionsRes = await api.get('/transactions', {
        params: { start: currentMonthStart, end: currentMonthEnd }
      })
      const currentMonthTransactions = extractArray(currentMonthTransactionsRes).map(normalizeTransaction) as Transaction[]
      const recentTransactionsRes = await api.get('/transactions', {
        params: { limit: 5 }
      })
      const recentTransactionsData = extractArray(recentTransactionsRes).map(normalizeTransaction) as Transaction[]
      if (recentTransactionsData) {
        setRecentTransactions(recentTransactionsData)
      }
      if (currentMonthTransactions) {
        const monthlyIncome = currentMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0)
        const monthlyExpenses = currentMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0)
        const netSavings = monthlyIncome - monthlyExpenses
        const allTransactionsRes = await api.get('/transactions')
        const allTransactions = extractArray(allTransactionsRes).map(normalizeTransaction) as Transaction[]
        const totalBalance = allTransactions?.reduce((sum: number, t: Transaction) => {
          const amount = t.amount || 0
          return t.type === 'income' ? sum + amount : sum - amount
        }, 0) || 0
        const previousMonthEnd = format(startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)), 'yyyy-MM-dd')
        const previousMonthTransactionsRes = await api.get('/transactions', {
          params: { start: previousMonthEnd, end: currentMonthStart }
        })
        const previousMonthTransactions = extractArray(previousMonthTransactionsRes).map(normalizeTransaction) as Transaction[]
        const previousMonthIncome = previousMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0)
        const previousMonthExpenses = previousMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0)
        setWalletStats({
          totalBalance,
          previousMonthBalance: totalBalance - monthlyIncome + previousMonthIncome,
          monthlyIncome,
          previousMonthIncome,
          monthlyExpenses,
          previousMonthExpenses,
          netSavings
        })
        const categorySpending: Record<string, number> = {}
        currentMonthTransactions
          .filter(t => t.type === 'expense' && t.category)
          .forEach((t: Transaction) => {
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
        const spendingByDay: Record<string, number> = {}
        const incomeByDay: Record<string, number> = {}
        const expenseTransactions = currentMonthTransactions.filter((t) => t.type === 'expense')
        expenseTransactions.forEach((t) => {
          if (t.date) {
            const day = format(new Date(t.date), 'dd/MM')
            spendingByDay[day] = (spendingByDay[day] || 0) + (t.amount || 0)
          }
        })
        const incomeTransactions = currentMonthTransactions.filter((t) => t.type === 'income')
        incomeTransactions.forEach((t) => {
          if (t.date) {
            const day = format(new Date(t.date), 'dd/MM')
            incomeByDay[day] = (incomeByDay[day] || 0) + (t.amount || 0)
          }
        })
        let highestSpendingDay = { date: '', amount: 0 }
        Object.entries(spendingByDay).forEach(([date, amount]) => {
          if (amount > highestSpendingDay.amount) {
            highestSpendingDay = { date, amount }
          }
        })
        let highestSpendingCategory = { category: '', amount: 0 }
        Object.entries(categorySpending).forEach(([category, amount]) => {
          if (amount > highestSpendingCategory.amount) {
            highestSpendingCategory = { category, amount }
          }
        })
        const daysPassed = differenceInDays(currentDate, startOfMonth(currentDate)) + 1
        const averageDailySpending = daysPassed > 0 ? monthlyExpenses / daysPassed : 0
        const totalDaysInMonth = getDaysInMonth(currentDate)
        const daysRemaining = totalDaysInMonth - daysPassed
        setMonthlySummary({
          highestSpendingDay,
          highestSpendingCategory,
          averageDailySpending,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        })
        const labels: string[] = []
        const expenseSeries: number[] = []
        const incomeSeries: number[] = []
        for (let d = 1; d <= totalDaysInMonth; d++) {
          const dayLabel = String(d).padStart(2, '0') + '/' + format(currentDate, 'MM')
          labels.push(dayLabel)
          expenseSeries.push(spendingByDay[dayLabel] || 0)
          incomeSeries.push(incomeByDay[dayLabel] || 0)
        }
        setDailySeries({ labels, income: incomeSeries, expense: expenseSeries })
      }
      const goalsRes = await api.get('/goals')
      const goals = extractArray(goalsRes).map(normalizeGoal) as Goal[]
      if (goals) {
        const goalsWithProgress = goals.map((goal, index) => ({
          ...goal,
          id: goal.id ?? String(index),
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  const formatCurrencyShort = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }
  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Thu/Chi theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Phạm vi</span>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={range}
                      onChange={(e) => setRange(e.target.value as '7d' | '30d')}
                    >
                      <option value="7d">7 ngày</option>
                      <option value="30d">30 ngày</option>
                    </select>
                  </div>
                </div>
                <Line
                  data={{
                    labels: range === '7d' ? dailySeries.labels.slice(-7) : dailySeries.labels,
                    datasets: [
                      {
                        label: 'Chi tiêu',
                        data: (range === '7d' ? dailySeries.expense.slice(-7) : dailySeries.expense),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3
                      },
                      {
                        label: 'Thu nhập',
                        data: (range === '7d' ? dailySeries.income.slice(-7) : dailySeries.income),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: true },
                      tooltip: { enabled: true }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Chi tiêu theo danh mục
                </CardTitle>
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
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: vi })}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
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
        </>
      )}
    </div>
  )
}

export default Dashboard
