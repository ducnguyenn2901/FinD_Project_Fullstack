import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { BarChart3, PieChart, TrendingUp, TrendingDown, Wallet, Calendar, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

type TransactionItem = {
  _id?: string
  id?: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  date: string
  wallet?: string
}

type RangeOption = '30d' | '90d' | '365d' | 'all'

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<RangeOption>('90d')
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [netBalance, setNetBalance] = useState(0)
  const [dailyLabels, setDailyLabels] = useState<string[]>([])
  const [dailyNet, setDailyNet] = useState<number[]>([])
  const [dailyIncomeData, setDailyIncomeData] = useState<number[]>([])
  const [dailyExpenseData, setDailyExpenseData] = useState<number[]>([])
  const [topCategories, setTopCategories] = useState<Array<{ category: string; amount: number; percentage: number }>>([])
  const [walletSummary, setWalletSummary] = useState<Array<{ wallet: string; amount: number }>>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setTransactions([])
      computeStats([], '', '')
      return
    }
    try {
      setLoading(true)
      const now = new Date()
      let params: Record<string, string> = {}
      let startIso = ''
      let endIso = ''

      if (range !== 'all') {
        const end = new Date(now)
        const start = new Date(now)
        if (range === '30d') {
          start.setDate(end.getDate() - 29)
        } else if (range === '90d') {
          start.setDate(end.getDate() - 89)
        } else if (range === '365d') {
          start.setDate(end.getDate() - 364)
        }
        startIso = start.toISOString().slice(0, 10)
        endIso = end.toISOString().slice(0, 10)
        params = { start: startIso, end: endIso }
      }

      const res = await api.get('/transactions', { params })
      const rows = (res.data || []) as TransactionItem[]
      setTransactions(rows)
      computeStats(rows, startIso, endIso)
    } catch {
      setTransactions([])
      computeStats([], '', '')
    } finally {
      setLoading(false)
    }
  }, [user, range])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const computeStats = (rows: TransactionItem[], startIso: string, endIso: string) => {
    let income = 0
    let expense = 0
    const categoryMap: Record<string, number> = {}
    const walletMap: Record<string, number> = {}
    const dailyMap: Record<string, number> = {}
    const dailyIncomeMap: Record<string, number> = {}
    const dailyExpenseMap: Record<string, number> = {}
    let minDate: Date | null = null
    let maxDate: Date | null = null

    rows.forEach((r) => {
      const amount = Number(r.amount) || 0
      if (r.type === 'income') {
        income += amount
      } else if (r.type === 'expense') {
        expense += amount
      }
      if (r.type === 'expense') {
        const cat = (r.category || 'Khác').trim()
        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(amount)
      }
      const wallet = (r.wallet || 'Khác').trim()
      walletMap[wallet] = (walletMap[wallet] || 0) + amount
      if (r.date) {
        const d = new Date(r.date)
        if (!isNaN(d.getTime())) {
          if (!minDate || d < minDate) {
            minDate = d
          }
          if (!maxDate || d > maxDate) {
            maxDate = d
          }
          const key = d.toISOString().slice(0, 10)
          const net = r.type === 'income' ? amount : -Math.abs(amount)
          dailyMap[key] = (dailyMap[key] || 0) + net
          
          if (r.type === 'income') {
            dailyIncomeMap[key] = (dailyIncomeMap[key] || 0) + amount
          } else {
            dailyExpenseMap[key] = (dailyExpenseMap[key] || 0) + Math.abs(amount)
          }
        }
      }
    })

    setTotalIncome(income)
    setTotalExpenses(expense)
    setNetBalance(income - expense)

    const totalByCategory = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)
    const top = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalByCategory ? Math.round((amount / totalByCategory) * 100) : 0
      }))
    setTopCategories(top)

    const wallets = Object.entries(walletMap)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([wallet, amount]) => ({
        wallet,
        amount
      }))
    setWalletSummary(wallets)

    if (!rows.length) {
      setDailyLabels([])
      setDailyNet([])
      setDailyIncomeData([])
      setDailyExpenseData([])
      setDateRange({ start: startIso, end: endIso })
      return
    }

    let startDate: Date | null = null
    let endDate: Date | null = null

    if (startIso && endIso) {
      startDate = new Date(startIso)
      endDate = new Date(endIso)
    } else {
      startDate = minDate
      endDate = maxDate
    }

    if (!startDate || !endDate) {
      setDailyLabels([])
      setDailyNet([])
      setDailyIncomeData([])
      setDailyExpenseData([])
      setDateRange({ start: '', end: '' })
      return
    }

    const labels: string[] = []
    const netSeries: number[] = []
    const incomeSeries: number[] = []
    const expenseSeries: number[] = []
    const cursor = new Date(startDate)
    
    // Safety check to prevent infinite loop if dates are invalid
    const maxIterations = 1000 
    let iterations = 0

    while (cursor <= endDate && iterations < maxIterations) {
      const key = cursor.toISOString().slice(0, 10)
      labels.push(cursor.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }))
      netSeries.push(dailyMap[key] || 0)
      incomeSeries.push(dailyIncomeMap[key] || 0)
      expenseSeries.push(dailyExpenseMap[key] || 0)
      
      cursor.setDate(cursor.getDate() + 1)
      iterations++
    }

    setDailyLabels(labels)
    setDailyNet(netSeries)
    setDailyIncomeData(incomeSeries)
    setDailyExpenseData(expenseSeries)
    setDateRange({
      start: startIso || startDate.toISOString().slice(0, 10),
      end: endIso || endDate.toISOString().slice(0, 10)
    })
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

  const hasData = transactions.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Phân tích tài chính
          </h1>
          <p className="text-muted-foreground">
            Xem tổng quan thu nhập, chi tiêu và danh mục theo thời gian.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right text-xs text-muted-foreground">
            {dateRange.start && dateRange.end && (
              <>
                <span>Khoảng thời gian phân tích</span>
                <span className="flex items-center justify-end gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(dateRange.start).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(dateRange.end).toLocaleDateString('vi-VN')}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Phạm vi</span>
            <select
              className="border rounded px-2 py-1 text-sm bg-background"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeOption)}
            >
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
              <option value="365d">12 tháng</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !hasData ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Chưa có dữ liệu giao dịch</p>
              <p className="text-sm text-muted-foreground">
                Thêm giao dịch trong phần Giao dịch để xem phân tích chi tiết.
              </p>
            </div>
            <Button asChild>
              <a href="/transactions">Đi tới trang Giao dịch</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Tổng thu nhập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactions.filter((t) => t.type === 'income').length} giao dịch thu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Tổng chi tiêu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totalExpenses))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactions.filter((t) => t.type === 'expense').length} giao dịch chi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  Số dư ròng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(netBalance)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Từ {transactions.length} giao dịch trong khoảng được chọn
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dòng tiền theo ngày
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Line
                  data={{
                    labels: dailyLabels,
                    datasets: [
                      {
                        label: 'Thu nhập',
                        data: dailyIncomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.3
                      },
                      {
                        label: 'Chi tiêu',
                        data: dailyExpenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3
                      },
                      {
                        label: 'Ròng',
                        data: dailyNet,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
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
                  Danh mục chi tiêu hàng đầu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col xl:flex-row items-center gap-6">
                  {topCategories.length > 0 ? (
                    <>
                      <div className="w-full xl:w-1/2 h-64 flex items-center justify-center">
                        <Pie
                          data={{
                            labels: topCategories.map((c) => c.category),
                            datasets: [
                              {
                                data: topCategories.map((c) => c.amount),
                                backgroundColor: [
                                  'rgba(239, 68, 68, 0.8)',
                                  'rgba(249, 115, 22, 0.8)',
                                  'rgba(234, 179, 8, 0.8)',
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(59, 130, 246, 0.8)',
                                  'rgba(168, 85, 247, 0.8)',
                                  'rgba(236, 72, 153, 0.8)'
                                ],
                                borderColor: [
                                  'rgb(239, 68, 68)',
                                  'rgb(249, 115, 22)',
                                  'rgb(234, 179, 8)',
                                  'rgb(34, 197, 94)',
                                  'rgb(59, 130, 246)',
                                  'rgb(168, 85, 247)',
                                  'rgb(236, 72, 153)'
                                ],
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  boxWidth: 12,
                                  padding: 15,
                                  font: { size: 11 }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="w-full xl:w-1/2 space-y-4">
                        {topCategories.map((item) => (
                          <div key={item.category} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.category}</Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground w-full text-center py-8">
                      Chưa có dữ liệu chi tiêu cho khoảng thời gian này.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Phân bổ theo ví
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {walletSummary.length > 0 ? (
                  walletSummary.map((item) => (
                    <div
                      key={item.wallet}
                      className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.wallet}</span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.amount >= 0 ? '+' : '-'}
                        {formatCurrencyShort(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có dữ liệu phân bổ theo ví.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tóm tắt nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tỉ lệ tiết kiệm</span>
                  <span className="font-semibold">
                    {totalIncome > 0
                      ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Chi tiêu trung bình mỗi giao dịch</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      transactions.filter((t) => t.type === 'expense').length > 0
                        ? Math.abs(
                            totalExpenses /
                              transactions.filter((t) => t.type === 'expense').length
                          )
                        : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Thu nhập trung bình mỗi giao dịch</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      transactions.filter((t) => t.type === 'income').length > 0
                        ? totalIncome /
                            transactions.filter((t) => t.type === 'income').length
                        : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Số ngày trong khoảng phân tích</span>
                  <span className="font-semibold">{dailyLabels.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics
