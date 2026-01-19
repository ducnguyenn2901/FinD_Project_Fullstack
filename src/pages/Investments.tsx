import { useState, useEffect, useCallback } from 'react'
 
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Progress } from '../components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
 
import { 
  Plus, 
  Search,
  Filter,
  Download,
  Brain,
  Loader2,
  AlertCircle,
  Bell,
  Newspaper,
  Upload,
  FileText,
  Calculator,
  Target,
  LineChart,
  Trash2
} from 'lucide-react'
import { Edit } from 'lucide-react'
import api from '../lib/api'
import { 
  InvestmentService, 
  type HistoricalData,
  type InvestmentNews,
  type ValidationResult
} from '../lib/investmentService'
import { format, parseISO } from 'date-fns'
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
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Types
interface Investment {
  id: string
  user_id: string
  symbol: string
  name: string
  type: 'stock' | 'crypto' | 'etf' | 'bond' | 'other'
  quantity: number
  avg_price: number
  currency: string
  current_price: number | null
  notes: string | null
  purchase_date: string
  created_at: string
  status?: string
}

interface PriceAlert {
  id: string
  symbol: string
  alert_type: 'above' | 'below'
  target_price: number
  triggered: boolean
  triggered_at: string | null
}

interface PortfolioTarget {
  category: string
  target_percentage: number
}

type SavingsGoal = {
  _id?: string
  id?: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  progress?: number
}
type InvalidRow = {
  symbol?: string
  error?: string
}

const Investments = () => {
  // State management
  const [activeTab, setActiveTab] = useState('investments')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [portfolioTargets, setPortfolioTargets] = useState<PortfolioTarget[]>([
    { category: 'stock', target_percentage: 50 },
    { category: 'crypto', target_percentage: 20 },
    { category: 'etf', target_percentage: 20 },
    { category: 'bond', target_percentage: 10 }
  ])
  const [exchangeRate, setExchangeRate] = useState(23000)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [investmentNews, setInvestmentNews] = useState<InvestmentNews[]>([])
  const [showHistoricalChart, setShowHistoricalChart] = useState(false)
  const [showNews, setShowNews] = useState(false)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [chartDays, setChartDays] = useState<7 | 30 | 90>(30)
  
  // Delete Dialog State
  const [deleteInvOpen, setDeleteInvOpen] = useState(false)
  const [invToDelete, setInvToDelete] = useState<string | null>(null)

  // Form states
  const [invEditOpen, setInvEditOpen] = useState(false)
  const [invEdit, setInvEdit] = useState<Investment | null>(null)
  const [invEditForm, setInvEditForm] = useState({
    quantity: '',
    avg_price: '',
    notes: '',
    status: 'active' as string
  })
  const [addOpen, setAddOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [symbolQuery, setSymbolQuery] = useState('')
  const [symbolResults, setSymbolResults] = useState<Array<{ symbol: string; name: string; exchange: string; type: string }>>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newInv, setNewInv] = useState<{
    symbol: string
    name: string
    type: 'stock' | 'crypto' | 'etf' | 'bond' | 'other'
    quantity: string
    avg_price: string
    currency: string
    purchase_date: string
    notes: string
    status: string
    current_price?: number | null
  }>({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: '',
    avg_price: '',
    currency: 'USD',
    purchase_date: '',
    notes: '',
    status: 'active',
    current_price: null
  })

  const mapSuggestionType = (t: string): 'stock' | 'crypto' | 'etf' => {
    const s = t.toLowerCase()
    if (s.includes('crypto')) return 'crypto'
    if (s.includes('etf')) return 'etf'
    return 'stock'
  }

  const handleDeleteInvestment = async () => {
    if (!invToDelete) return
    try {
      await api.delete(`/investments/${invToDelete}`)
      toast.success('Đã xóa khoản đầu tư thành công')
      setDeleteInvOpen(false)
      fetchInvestments()
    } catch (error) {
      console.error('Error deleting investment:', error)
      toast.error('Không thể xóa khoản đầu tư')
    }
  }

  useEffect(() => {
    let mounted = true
    const q = symbolQuery.trim()
    if (!q) {
      setSymbolResults([])
      return
    }
    const id = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const results = await InvestmentService.searchSymbols(q)
        if (!mounted) return
        setSymbolResults(results)
      } catch {
        if (!mounted) return
        setSymbolResults([])
      } finally {
        if (mounted) setSearchLoading(false)
      }
    }, 300)
    return () => {
      mounted = false
      clearTimeout(id)
    }
  }, [symbolQuery])

  const autofillFromSymbol = async (symbol: string, type: 'stock' | 'crypto' | 'etf') => {
    try {
      if (type === 'stock') {
        const q = await InvestmentService.validateStock(symbol)
        if (q) {
          setNewInv(prev => ({
            ...prev,
            symbol: q.symbol,
            name: q.name,
            type: 'stock',
            currency: q.currency || 'USD',
            current_price: q.price,
            avg_price: prev.avg_price || String(q.price || '')
          }))
        }
      } else if (type === 'etf') {
        const q = await InvestmentService.validateETF(symbol)
        if (q) {
          setNewInv(prev => ({
            ...prev,
            symbol: q.symbol,
            name: q.name,
            type: 'etf',
            currency: 'USD',
            current_price: q.price,
            avg_price: prev.avg_price || String(q.price || '')
          }))
        }
      } else if (type === 'crypto') {
        const q = await InvestmentService.validateCrypto(symbol)
        if (q) {
          setNewInv(prev => ({
            ...prev,
            symbol: q.symbol,
            name: q.name,
            type: 'crypto',
            currency: 'USD',
            current_price: q.current_price,
            avg_price: prev.avg_price || String(q.current_price || '')
          }))
        }
      }
    } catch {
      return
    }
  }

  const handleSelectSuggestion = async (s: { symbol: string; name: string; type: string }) => {
    const t = mapSuggestionType(s.type)
    setNewInv(prev => ({
      ...prev,
      symbol: s.symbol.toUpperCase(),
      name: s.name || s.symbol.toUpperCase(),
      type: t
    }))
    setSymbolQuery(s.symbol.toUpperCase())
    await autofillFromSymbol(s.symbol, t)
  }

  const handleSaveNewInvestment = async () => {
    const errs: Record<string, string> = {}
    const qty = parseFloat(newInv.quantity)
    const avg = parseFloat(newInv.avg_price)
    if (!newInv.symbol) errs.symbol = 'Vui lòng nhập mã'
    if (!newInv.type) errs.type = 'Vui lòng chọn loại'
    if (!(qty > 0)) errs.quantity = 'Số lượng phải lớn hơn 0'
    if (isNaN(avg) || avg < 0) errs.avg_price = 'Giá trung bình phải ≥ 0'
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    try {
      setIsSaving(true)
      const payload = {
        symbol: newInv.symbol.toUpperCase(),
        name: newInv.name || newInv.symbol.toUpperCase(),
        type: newInv.type,
        quantity: parseFloat(newInv.quantity) || 0,
        avg_price: parseFloat(newInv.avg_price) || 0,
        currency: newInv.currency || 'USD',
        current_price: newInv.current_price ?? null,
        notes: newInv.notes || '',
        purchase_date: newInv.purchase_date || null,
        status: newInv.status || 'active'
      }
      await api.post('/investments', payload)
      setAddOpen(false)
      setNewInv({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: '',
        avg_price: '',
        currency: 'USD',
        purchase_date: '',
        notes: '',
        status: 'active',
        current_price: null
      })
      setSymbolQuery('')
      setSymbolResults([])
      await fetchInvestments()
    } catch (error) {
      console.error('Error creating investment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // CSV Import/Export
  const [csvImportDialog, setCsvImportDialog] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvValidationResults, setCsvValidationResults] = useState<{
    validRows: unknown[]
    invalidRows: InvalidRow[]
    validationResults: ValidationResult[]
  } | null>(null)

  // Price Alerts
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    alert_type: 'above' as 'above' | 'below',
    target_price: ''
  })

  // Real-time subscription
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)
  const [pollingId, setPollingId] = useState<number | null>(null)

  // Initialize (placed after fetchAllData declaration for TS)

  // Setup real-time subscription
  const setupRealTimeSubscription = () => {
    setRealTimeEnabled(false)
    return null as unknown
  }
  const startPollingPrices = () => {
    if (pollingId) return
    const id = window.setInterval(async () => {
      try {
        const updated = await Promise.all(investments.map(async inv => {
          let price = inv.current_price || inv.avg_price
          if (inv.type === 'stock') {
            const s = await InvestmentService.validateStock(inv.symbol)
            price = s?.price || price
          } else if (inv.type === 'crypto') {
            const c = await InvestmentService.validateCrypto(inv.symbol)
            price = c?.current_price || price
          } else if (inv.type === 'etf') {
            const e = await InvestmentService.validateETF(inv.symbol)
            price = e?.price || price
          }
          return { ...inv, current_price: price }
        }))
        setInvestments(updated)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 15000)
    setPollingId(id)
  }
  const stopPollingPrices = () => {
    if (pollingId) {
      window.clearInterval(pollingId)
      setPollingId(null)
    }
  }

  // Fetch all data
  const fetchInvestments = useCallback(async () => {
    try {
      const res = await api.get('/investments')
      const data = (res.data || []) as Array<Investment & { _id: string }>
      setInvestments(
        data.map(d => ({
          ...d,
          id: d._id
        }))
      )
    } catch (error) {
      console.error('Error fetching investments:', error)
    }
  }, [])

  const fetchPriceAlerts = useCallback(async () => {
    try {
      setPriceAlerts([])
    } catch (error) {
      console.error('Error fetching price alerts:', error)
    }
  }, [])

  const fetchExchangeRate = useCallback(async () => {
    const rate = await InvestmentService.getExchangeRate()
    setExchangeRate(rate)
  }, [])

  const fetchSavingsGoals = useCallback(async () => {
    try {
      const res = await api.get('/goals')
      const goals = res.data || []
      const withProgress = goals.map((goal: SavingsGoal) => ({
        ...goal,
        progress: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
      }))
      setSavingsGoals(withProgress)
    } catch (error) {
      console.error('Error fetching savings goals:', error)
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchInvestments(),
        fetchPriceAlerts(),
        fetchExchangeRate(),
        fetchSavingsGoals()
      ])
    } catch (error) {
      console.error('Error fetching all investment data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchInvestments, fetchPriceAlerts, fetchExchangeRate, fetchSavingsGoals])

  useEffect(() => {
    fetchAllData()
    setupRealTimeSubscription()
    return () => {
      setRealTimeEnabled(false)
      stopPollingPrices()
    }
  }, [fetchAllData])

  // Load historical data
  const loadHistoricalData = async (investment: Investment) => {
    try {
      const dataType = (investment.type === 'stock' || investment.type === 'crypto' || investment.type === 'etf') ? investment.type : 'stock'
      const data = await InvestmentService.getHistoricalData(investment.symbol, dataType, chartDays)
      setHistoricalData(data)
      setShowHistoricalChart(true)
    } catch (error) {
      console.error('Error loading historical data:', error)
    }
  }

  // Load news
  const loadInvestmentNews = async (investment: Investment) => {
    try {
      const dataType = (investment.type === 'stock' || investment.type === 'crypto' || investment.type === 'etf') ? investment.type : 'stock'
      const news = await InvestmentService.getInvestmentNews(investment.symbol, dataType, 5)
      setInvestmentNews(news)
      setShowNews(true)
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  // CSV Import
  const handleCSVImport = async () => {
    if (!csvFile) return

    try {
      const text = await csvFile.text()
      const rows = InvestmentService.parseCSV(text)
      
      const results = await InvestmentService.validateCSVBatch(rows)
      setCsvValidationResults(results)
    } catch (error) {
      console.error('Error importing CSV:', error)
    }
  }

  const importValidatedRows = async () => {
    if (!csvValidationResults) return

    try {
      setCsvImportDialog(false)
      setCsvFile(null)
      setCsvValidationResults(null)
      fetchInvestments()
    } catch (error) {
      console.error('Error importing validated rows:', error)
    }
  }

  // CSV Export
  const handleCSVExport = () => {
    const csv = InvestmentService.generateCSV(investments)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investments_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Add price alert
  const handleAddAlert = async () => {
    try {
      const created = {
        id: String(Date.now()),
        symbol: newAlert.symbol,
        alert_type: newAlert.alert_type,
        target_price: parseFloat(newAlert.target_price),
        triggered: false,
        triggered_at: null
      } as PriceAlert
      setPriceAlerts((prev) => [...prev, created])

      setNewAlert({ symbol: '', alert_type: 'above', target_price: '' })
      setAlertDialogOpen(false)
      fetchPriceAlerts()
    } catch (error) {
      console.error('Error adding alert:', error)
    }
  }

  // Portfolio rebalancing calculation
  const calculateRebalancing = () => {
    const currentAllocation = calculatePortfolioAllocation()
    const targetAllocation = portfolioTargets.reduce((acc, target) => ({
      ...acc,
      [target.category]: target.target_percentage
    }), {})

    const totalValue = calculatePortfolioSummary().totalValue
    return InvestmentService.calculateRebalancing(
      currentAllocation,
      targetAllocation,
      totalValue
    )
  }

  const calculatePortfolioAllocation = () => {
    const summary = calculatePortfolioSummary()
    const totalValue = summary.totalValue
    if (totalValue <= 0) {
      return {
        stock: 0,
        crypto: 0,
        etf: 0,
        bond: 0,
        other: 0
      }
    }
    return {
      stock: (summary.stocksValue / totalValue) * 100,
      crypto: (summary.cryptoValue / totalValue) * 100,
      etf: (summary.etfValue / totalValue) * 100,
      bond: (summary.bondValue / totalValue) * 100,
      other: (summary.otherValue / totalValue) * 100
    }
  }

  const calculatePortfolioSummary = () => {
    let totalValue = 0
    let dailyChange = 0
    let stocksValue = 0
    let cryptoValue = 0
    let etfValue = 0
    let bondValue = 0
    let otherValue = 0

    investments.forEach(investment => {
      const currentPrice = investment.current_price || investment.avg_price
      const value = investment.quantity * currentPrice * exchangeRate
      const cost = investment.quantity * investment.avg_price * exchangeRate
      const change = value - cost

      totalValue += value
      dailyChange += change

      switch (investment.type) {
        case 'stock':
          stocksValue += value
          break
        case 'crypto':
          cryptoValue += value
          break
        case 'etf':
          etfValue += value
          break
        case 'bond':
          bondValue += value
          break
        case 'other':
          otherValue += value
          break
      }
    })

    const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0

    return {
      totalValue,
      dailyChange,
      dailyChangePercent,
      stocksValue,
      cryptoValue,
      etfValue,
      bondValue,
      otherValue
    }
  }

  // const portfolioSummary = calculatePortfolioSummary()

  // Formatting functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCurrencyUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Historical chart configuration
  const sma = (arr: number[], window = 5) => {
    const result: number[] = []
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - window + 1)
      const slice = arr.slice(start, i + 1)
      const avg = slice.reduce((s, v) => s + v, 0) / slice.length
      result.push(Number.isFinite(avg) ? avg : 0)
    }
    return result
  }
  const historicalChartData = {
    labels: historicalData.map(d => format(parseISO(d.date), 'dd/MM')),
    datasets: [
      {
        label: 'Price',
        data: historicalData.map(d => d.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'SMA(5)',
        data: sma(historicalData.map(d => d.close), 5),
        borderColor: 'rgb(16, 185, 129)',
        borderDash: [6, 4],
        tension: 0.2
      }
    ]
  }

  const historicalChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: `Historical Price - ${selectedInvestment?.symbol}` },
      tooltip: { enabled: true }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Danh mục Đầu tư</h1>
            {realTimeEnabled && (
              <Badge className="bg-green-100 text-green-800">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  Real-time
                </div>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Theo dõi và quản lý các khoản đầu tư của bạn</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tỷ giá USD/VND: {exchangeRate.toLocaleString('vi-VN')}₫
          </p>
        </div>
        
          <div className="flex flex-wrap gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm đầu tư
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm khoản đầu tư mới</DialogTitle>
                  <DialogDescription>
                    Thêm cổ phiếu, tiền điện tử hoặc các khoản đầu tư khác vào danh mục.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mã</Label>
                    <div className="relative">
                      <Input
                        placeholder="VD: AAPL, BTC"
                        value={symbolQuery}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase()
                          setSymbolQuery(val)
                          setNewInv({ ...newInv, symbol: val })
                          setSelectedSuggestionIndex(-1)
                        }}
                        onKeyDown={(e) => {
                          if (symbolResults.length === 0) return
                          if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setSelectedSuggestionIndex((prev) => Math.min(prev + 1, symbolResults.length - 1))
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0))
                          } else if (e.key === 'Enter') {
                            if (selectedSuggestionIndex >= 0) {
                              const choice = symbolResults[selectedSuggestionIndex]
                              handleSelectSuggestion(choice)
                              e.preventDefault()
                            }
                          }
                        }}
                      />
                      {formErrors.symbol && (
                        <div className="text-xs text-red-600 mt-1">{formErrors.symbol}</div>
                      )}
                      {symbolQuery && (
                        <div className="absolute z-10 mt-1 w-full border rounded-md bg-white shadow">
                          {searchLoading ? (
                            <div className="p-2 text-sm text-muted-foreground">Đang tìm kiếm...</div>
                          ) : symbolResults.length > 0 ? (
                            symbolResults.slice(0, 8).map((s, idx) => (
                              <button
                                key={`${s.symbol}-${s.type}`}
                                className={`w-full text-left px-3 py-2 hover:bg-muted ${idx === selectedSuggestionIndex ? 'bg-muted' : ''}`}
                                onClick={() => handleSelectSuggestion(s)}
                                type="button"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{s.symbol}</div>
                                  <div className="text-xs">{s.exchange}</div>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center justify-between">
                                  <span>{s.name}</span>
                                  <span className="border rounded px-1">{mapSuggestionType(s.type)}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">Không có gợi ý</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên</Label>
                      <Input
                        value={newInv.name}
                        onChange={(e) => setNewInv({ ...newInv, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loại</Label>
                      <Select
                        value={newInv.type}
                        onValueChange={(v) => setNewInv({ ...newInv, type: v as 'stock' | 'crypto' | 'etf' | 'bond' | 'other' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock">Cổ phiếu</SelectItem>
                          <SelectItem value="etf">ETF</SelectItem>
                          <SelectItem value="crypto">Tiền điện tử</SelectItem>
                          <SelectItem value="bond">Trái phiếu</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.type && (
                        <div className="text-xs text-red-600 mt-1">{formErrors.type}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={newInv.quantity}
                        onChange={(e) => setNewInv({ ...newInv, quantity: e.target.value })}
                      />
                      {formErrors.quantity && (
                        <div className="text-xs text-red-600 mt-1">{formErrors.quantity}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Giá TB (USD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newInv.avg_price}
                        onChange={(e) => setNewInv({ ...newInv, avg_price: e.target.value })}
                      />
                      {formErrors.avg_price && (
                        <div className="text-xs text-red-600 mt-1">{formErrors.avg_price}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tiền tệ</Label>
                      <Input
                        value={newInv.currency}
                        onChange={(e) => setNewInv({ ...newInv, currency: e.target.value })}
                        readOnly={newInv.type === 'stock' || newInv.type === 'etf' || newInv.type === 'crypto'}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {newInv.type === 'stock' || newInv.type === 'etf' || newInv.type === 'crypto'
                          ? `Tự động theo symbol: ${newInv.currency}`
                          : 'Có thể nhập thủ công'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ngày mua</Label>
                      <Input
                        type="date"
                        value={newInv.purchase_date}
                        onChange={(e) => setNewInv({ ...newInv, purchase_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={newInv.notes}
                      onChange={(e) => setNewInv({ ...newInv, notes: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={newInv.status}
                      onValueChange={(v) => setNewInv({ ...newInv, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang nắm giữ</SelectItem>
                        <SelectItem value="sold">Đã bán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNewInvestment} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Lưu
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant={realTimeEnabled ? "default" : "outline"}
              onClick={() => {
                const next = !realTimeEnabled
                setRealTimeEnabled(next)
                if (next) startPollingPrices()
                else stopPollingPrices()
              }}
            >
              {realTimeEnabled ? 'Đang cập nhật realtime' : 'Bật cập nhật realtime'}
            </Button>
          
          <Button variant="outline" onClick={() => setCsvImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          
          <Button variant="outline" onClick={handleCSVExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Portfolio Summary with real-time updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... giữ nguyên summary cards ... */}
      </div>

      {/* Price Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Cảnh báo giá
            </div>
            <Button size="sm" onClick={() => setAlertDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm cảnh báo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceAlerts.length > 0 ? (
            <div className="space-y-2">
              {priceAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{alert.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.alert_type === 'above' ? 'Trên' : 'Dưới'} {formatCurrencyUSD(alert.target_price)}
                    </div>
                  </div>
                  <Badge variant={alert.triggered ? "destructive" : "outline"}>
                    {alert.triggered ? 'Đã kích hoạt' : 'Đang chờ'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Chưa có cảnh báo nào. Thêm cảnh báo để nhận thông báo khi giá đạt ngưỡng.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Historical Chart Modal */}
      <Dialog open={showHistoricalChart} onOpenChange={setShowHistoricalChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Biểu đồ giá {selectedInvestment?.symbol} - {chartDays} ngày
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">Khoảng thời gian</span>
            <Select value={String(chartDays)} onValueChange={(v) => setChartDays(Number(v) as 7 | 30 | 90)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="90">90 ngày</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedInvestment) loadHistoricalData(selectedInvestment)
              }}
            >
              Tải dữ liệu
            </Button>
          </div>
          <div className="h-96">
            <Line data={historicalChartData} options={historicalChartOptions} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Giá cao nhất</div>
              <div className="text-lg font-bold">
                {formatCurrencyUSD(Math.max(...historicalData.map(d => d.high)))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Giá thấp nhất</div>
              <div className="text-lg font-bold">
                {formatCurrencyUSD(Math.min(...historicalData.map(d => d.low)))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* News Modal */}
      <Dialog open={showNews} onOpenChange={setShowNews}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Tin tức {selectedInvestment?.symbol}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {investmentNews.map((news, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{news.title}</h4>
                  <Badge variant="outline">{news.source}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{news.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(news.publishedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={news.url} target="_blank" rel="noopener noreferrer">
                      Đọc thêm
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={csvImportDialog} onOpenChange={setCsvImportDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import từ CSV</DialogTitle>
            <DialogDescription>
              Upload file CSV để import nhiều đầu tư cùng lúc. File cần có các cột: symbol, type, quantity, avg_price
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csv-upload"
              />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="font-medium">Click để chọn file CSV</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {csvFile ? csvFile.name : 'Chưa chọn file'}
                </div>
              </Label>
            </div>

            {csvFile && (
              <Button onClick={handleCSVImport} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Kiểm tra và Validate
              </Button>
            )}

            {csvValidationResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-600">
                        Hợp lệ: {csvValidationResults.validRows.length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-600">
                        Không hợp lệ: {csvValidationResults.invalidRows.length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {csvValidationResults.invalidRows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Lỗi validation:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {csvValidationResults.invalidRows.map((row, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>{row.symbol}: {row.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCsvValidationResults(null)}>
                    Hủy
                  </Button>
                  <Button onClick={importValidatedRows}>
                    Import {csvValidationResults.validRows.length} đầu tư
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteInvOpen} onOpenChange={setDeleteInvOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khoản đầu tư này sẽ bị xóa khỏi danh mục của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvestment} className="bg-red-600 hover:bg-red-700">
              Xóa đầu tư
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Price Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cảnh báo giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã đầu tư</Label>
              <Input
                placeholder="VD: AAPL, BTC"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Loại cảnh báo</Label>
              <Select
                value={newAlert.alert_type}
                onValueChange={(value: 'above' | 'below') => 
                  setNewAlert({...newAlert, alert_type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Trên mức giá</SelectItem>
                  <SelectItem value="below">Dưới mức giá</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mức giá mục tiêu (USD)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newAlert.target_price}
                onChange={(e) => setNewAlert({...newAlert, target_price: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAlert}>Thêm cảnh báo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="investments">Đầu tư</TabsTrigger>
          <TabsTrigger value="rebalancing">Cân bằng danh mục</TabsTrigger>
          <TabsTrigger value="tax">Tính thuế</TabsTrigger>
          <TabsTrigger value="analysis">Phân tích AI</TabsTrigger>
        </TabsList>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã hoặc tên..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>

          {/* Investment table with actions */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá TB</TableHead>
                  <TableHead>Giá hiện tại</TableHead>
                  <TableHead>Giá trị (VND)</TableHead>
                  <TableHead>Lời/Lỗ</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments
                  .filter(inv => 
                    inv.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    inv.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((investment) => {
                    const value = (investment.quantity * (investment.current_price || investment.avg_price)) * exchangeRate
                    const cost = investment.quantity * investment.avg_price * exchangeRate
                    const profitLoss = value - cost
                    const profitLossPercent = cost > 0 ? (profitLoss / cost) * 100 : 0
                    
                    return (
                      <TableRow key={investment.id}>
                        <TableCell className="font-bold">{investment.symbol}</TableCell>
                        <TableCell>{investment.name}</TableCell>
                        <TableCell>{investment.quantity.toLocaleString('vi-VN')}</TableCell>
                        <TableCell>{formatCurrencyUSD(investment.avg_price)}</TableCell>
                        <TableCell>
                          {formatCurrencyUSD(investment.current_price || investment.avg_price)}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(value)}</TableCell>
                        <TableCell className={profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} ({profitLossPercent.toFixed(2)}%)
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedInvestment(investment)
                                loadHistoricalData(investment)
                              }}
                              title="Xem biểu đồ"
                            >
                              <LineChart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedInvestment(investment)
                                loadInvestmentNews(investment)
                              }}
                              title="Xem tin tức"
                            >
                              <Newspaper className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setNewAlert({
                                  symbol: investment.symbol,
                                  alert_type: 'above',
                                  target_price: ''
                                })
                                setAlertDialogOpen(true)
                              }}
                              title="Thêm cảnh báo"
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setInvEdit(investment)
                                setInvEditForm({
                                  quantity: String(investment.quantity),
                                  avg_price: String(investment.avg_price),
                                  notes: investment.notes || '',
                                  status: investment.status || 'active'
                                })
                                setInvEditOpen(true)
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => {
                                setInvToDelete(investment.id)
                                setDeleteInvOpen(true)
                              }}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Rebalancing Tab */}
        <TabsContent value="rebalancing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Cân bằng Danh mục
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current vs Target Allocation */}
              <div className="space-y-4">
                <h4 className="font-medium">Phân bổ hiện tại vs Mục tiêu</h4>
                <div className="space-y-4">
                  {['stock', 'crypto', 'etf', 'bond', 'other'].map((category) => {
                    const currentAlloc = calculatePortfolioAllocation()
                    const target = portfolioTargets.find(t => t.category === category)
                    const current = currentAlloc[category as keyof typeof currentAlloc] || 0
                    const targetValue = target?.target_percentage || 0
                    const diff = current - targetValue
                    
                    if (targetValue === 0 && current === 0) return null
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="capitalize">{category}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{current.toFixed(1)}%</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm font-medium">{targetValue}%</span>
                            <Badge variant={Math.abs(diff) < 5 ? "outline" : diff > 0 ? "destructive" : "default"}>
                              {Math.abs(diff) < 5 ? 'Ổn định' : diff > 0 ? 'Bán' : 'Mua'}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute h-full bg-blue-300"
                            style={{ width: `${Math.min(100, current)}%` }}
                          ></div>
                          <div 
                            className="absolute h-full border-r-2 border-red-500"
                            style={{ left: `${targetValue}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rebalancing Actions */}
              <div className="space-y-4">
                <h4 className="font-medium">Đề xuất hành động</h4>
                <div className="space-y-3">
                  {Object.entries(calculateRebalancing()).map(([category, data]) => {
                    if (data.action === 'hold') return null
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{category}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.action === 'buy' ? 'Cần mua thêm' : 'Cần bán bớt'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatCurrency(data.difference * exchangeRate)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.abs(data.percentageDiff).toFixed(1)}% {data.action === 'buy' ? 'dưới' : 'trên'} mục tiêu
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Target Allocation Editor */}
              <div className="space-y-4">
                <h4 className="font-medium">Điều chỉnh mục tiêu</h4>
                <div className="space-y-3">
                  {portfolioTargets.map((target, index) => (
                    <div key={target.category} className="flex items-center gap-4">
                      <div className="w-32 capitalize">{target.category}</div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={target.target_percentage}
                          onChange={(e) => {
                            const newTargets = [...portfolioTargets]
                            newTargets[index].target_percentage = parseFloat(e.target.value) || 0
                            setPortfolioTargets(newTargets)
                          }}
                        />
                      </div>
                      <div className="w-20 text-right">%</div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span>Tổng:</span>
                    <span className="font-bold">
                      {portfolioTargets.reduce((sum, t) => sum + t.target_percentage, 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Calculator Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tính Thuế Đầu tư
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tax Calculator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Mô phỏng bán đầu tư</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Chọn đầu tư</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đầu tư" />
                        </SelectTrigger>
                        <SelectContent>
                          {investments.map(inv => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.symbol} - {inv.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Số lượng bán</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Giá bán (USD)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    
                    <Button className="w-full">Tính thuế</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Kết quả tính thuế</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Lợi nhuận:</span>
                      <span className="font-medium text-green-600">+$1,250.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian nắm giữ:</span>
                      <span className="font-medium">180 ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại thuế:</span>
                      <Badge variant="outline">Ngắn hạn</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tỷ lệ thuế:</span>
                      <span className="font-medium">22.5%</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Thuế phải nộp:</span>
                        <span className="text-red-600">$281.25</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-2">
                        <span>Tiền nhận được:</span>
                        <span className="text-green-600">$968.75</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Summary */}
              <div className="space-y-4">
                <h4 className="font-medium">Tổng quan thuế năm nay</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Lợi nhuận đã thực hiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(1250000)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Thuế ước tính
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(281250)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Lợi nhuận chưa thực hiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(4525075)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tax Report Download */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Báo cáo thuế</h4>
                    <p className="text-sm text-muted-foreground">
                      Tải báo cáo thuế chi tiết cho năm 2024
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Phân tích AI danh mục đầu tư
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Tổng giá trị danh mục</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculatePortfolioSummary().totalValue)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Thay đổi trong ngày</div>
                  <div className={`text-2xl font-bold ${calculatePortfolioSummary().dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculatePortfolioSummary().dailyChange)} ({calculatePortfolioSummary().dailyChangePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">USD/VND</div>
                  <div className="text-2xl font-bold">{exchangeRate.toLocaleString('vi-VN')}₫</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Đề xuất cân bằng (AI)</h4>
                <div className="space-y-3">
                  {Object.entries(calculateRebalancing()).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{category}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.action === 'hold' ? 'Giữ nguyên' : data.action === 'buy' ? 'Mua thêm' : 'Bán bớt'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatCurrency(data.difference * exchangeRate)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.abs(data.percentageDiff).toFixed(1)}% {data.action === 'buy' ? 'dưới' : data.action === 'sell' ? 'trên' : ''} mục tiêu
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tiến độ Mục tiêu tiết kiệm</h4>
                {savingsGoals.length > 0 ? (
                  savingsGoals.map((goal) => (
                    <div key={goal.id || goal._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm font-bold">{goal.progress || 0}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có mục tiêu tiết kiệm</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={invEditOpen} onOpenChange={setInvEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khoản đầu tư</DialogTitle>
            <DialogDescription>
              Cập nhật số lượng, giá trung bình và ghi chú
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Số lượng</Label>
                <Input
                  type="number"
                  value={invEditForm.quantity}
                  onChange={(e) => setInvEditForm({ ...invEditForm, quantity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Giá trung bình (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invEditForm.avg_price}
                  onChange={(e) => setInvEditForm({ ...invEditForm, avg_price: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select
                value={invEditForm.status}
                onValueChange={(v) => setInvEditForm({ ...invEditForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang nắm giữ</SelectItem>
                  <SelectItem value="sold">Đã bán</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={invEditForm.notes}
                onChange={(e) => setInvEditForm({ ...invEditForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!invEdit) return
                try {
                  const id = invEdit.id
                  await api.patch(`/investments/${id}`, {
                    quantity: parseFloat(invEditForm.quantity) || 0,
                    avg_price: parseFloat(invEditForm.avg_price) || 0,
                    notes: invEditForm.notes,
                    status: invEditForm.status
                  })
                  setInvEditOpen(false)
                  setInvEdit(null)
                  fetchInvestments()
                } catch (error) {
                  console.error('Error updating investment:', error)
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Investments
