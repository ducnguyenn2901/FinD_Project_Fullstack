import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Search, Download, Plus, MoreVertical, Calendar, Wallet, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { AutoClassifyButton } from '../components/expense/AutoClassifyButton'
import { classifyTransaction, getSuggestions } from '../utils/aiCategoryClassifier'

const Transactions = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  type TransactionItem = {
    _id?: string
    id?: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    wallet: string
    notes?: string
  }
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Thực phẩm',
    date: new Date().toISOString().split('T')[0],
    wallet: 'Thẻ chính',
    notes: ''
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState<TransactionItem | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Thực phẩm',
    date: new Date().toISOString().split('T')[0],
    wallet: 'Thẻ chính',
    notes: ''
  })
  const [newAiSuggestion, setNewAiSuggestion] = useState<{
    category: string
    confidence: number
    matchedKeywords: string[]
    alternatives: Array<{ category: string; confidence: number }>
  } | null>(null)
  const [newAiList, setNewAiList] = useState<Array<{ category: string; confidence: number }>>([])
  const [editAiSuggestion, setEditAiSuggestion] = useState<{
    category: string
    confidence: number
    matchedKeywords: string[]
    alternatives: Array<{ category: string; confidence: number }>
  } | null>(null)
  const [editAiList, setEditAiList] = useState<Array<{ category: string; confidence: number }>>([])
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<any[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [csvEncoding, setCsvEncoding] = useState<'utf-8' | 'utf-16' | 'windows-1258'>('utf-8')
  const [csvDelimiter, setCsvDelimiter] = useState<string | null>(null)
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  useEffect(() => {
    const desc = newTransaction.description
    const amt = parseFloat(String(newTransaction.amount || '')) || 0
    const consideredAmount = newTransaction.type === 'income' && amt > 0 ? amt : 0
    if (desc && desc.trim().length > 0) {
      const result = classifyTransaction(desc, consideredAmount)
      setNewAiSuggestion({
        category: result.category,
        confidence: result.confidence,
        matchedKeywords: result.matchedKeywords,
        alternatives: result.alternatives || []
      })
      setNewAiList(getSuggestions(desc, 3))
    } else {
      setNewAiSuggestion(null)
      setNewAiList([])
    }
  }, [newTransaction.description, newTransaction.amount, newTransaction.type])

  useEffect(() => {
    const desc = editForm.description
    const amt = parseFloat(String(editForm.amount || '')) || 0
    const consideredAmount = editForm.type === 'income' && amt > 0 ? amt : 0
    if (desc && desc.trim().length > 0) {
      const result = classifyTransaction(desc, consideredAmount)
      setEditAiSuggestion({
        category: result.category,
        confidence: result.confidence,
        matchedKeywords: result.matchedKeywords,
        alternatives: result.alternatives || []
      })
      setEditAiList(getSuggestions(desc, 3))
    } else {
      setEditAiSuggestion(null)
      setEditAiList([])
    }
  }, [editForm.description, editForm.amount, editForm.type])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/transactions')
      setTransactions(res.data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (t: TransactionItem) => {
    setEditTransaction(t)
    setEditForm({
      description: t.description,
      amount: String(Math.abs(t.amount || 0)),
      type: t.type,
      category: t.category,
      date: t.date,
      wallet: t.wallet,
      notes: t.notes || ''
    })
    setIsEditOpen(true)
  }

  const handleUpdateTransaction = async () => {
    if (!editTransaction) return
    try {
      const id = editTransaction._id || editTransaction.id
      const amount = parseFloat(editForm.amount)
      if (isNaN(amount)) {
        alert('Vui lòng nhập số tiền hợp lệ')
        return
      }
      const payload = {
        description: editForm.description,
        amount: Math.abs(amount),
        type: editForm.type,
        category: editForm.category,
        date: editForm.date,
        wallet: editForm.wallet,
        notes: editForm.notes
      }
      await api.patch(`/transactions/${id}`, payload)
      setIsEditOpen(false)
      setEditTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Không thể cập nhật giao dịch. Vui lòng thử lại.')
    }
  }

  const handleApplyClassification = (updated: { id: number; date: string; description: string; category: string; amount: number }[]) => {
    setTransactions(prev =>
      prev.map((t, idx) => {
        const match = updated.find(u => u.id === idx)
        if (match && match.category && match.category !== t.category) {
          return { ...t, category: match.category }
        }
        return t
      })
    )
  }

  const handleAddTransaction = async () => {
    try {
      const amount = parseFloat(newTransaction.amount)
      if (isNaN(amount)) {
        alert('Vui lòng nhập số tiền hợp lệ')
        return
      }

      const transactionData = {
        description: newTransaction.description,
        amount: Math.abs(amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        wallet: newTransaction.wallet,
        notes: newTransaction.notes
      }

      await api.post('/transactions', transactionData)

      // Reset form
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Thực phẩm',
        date: new Date().toISOString().split('T')[0],
        wallet: 'Thẻ chính',
        notes: ''
      })
      
      setIsDialogOpen(false)
      fetchTransactions() // Refresh list
      
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Không thể thêm giao dịch. Vui lòng thử lại.')
    }
  }

  const handleDeleteTransaction = async (id: string | number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return
    
    try {
      await api.delete(`/transactions/${id}`)
      
      fetchTransactions() // Refresh list
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Không thể xóa giao dịch. Vui lòng thử lại.')
    }
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Ngày', 'Mô tả', 'Danh mục', 'Ví', 'Số tiền', 'Loại', 'Ghi chú']
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.wallet,
        t.amount,
        t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }
  const guessField = (header: string) => {
    const h = header.toLowerCase().trim()
    if (/(date|ngày)/i.test(h)) return 'date'
    if (/(desc|mô tả|description)/i.test(h)) return 'description'
    if (/(cat|danh mục|category)/i.test(h)) return 'category'
    if (/(wallet|ví)/i.test(h)) return 'wallet'
    if (/(amount|số tiền|giá trị|value)/i.test(h)) return 'amount'
    if (/(type|loại)/i.test(h)) return 'type'
    if (/(note|ghi chú)/i.test(h)) return 'notes'
    if (/(id|mã)/i.test(h)) return 'id'
    return ''
  }
  const parseAmount = (raw: string) => {
    if (raw == null) return 0
    const s = String(raw).trim()
    const normalized = s
      .replace(/\s/g, '')
      .replace(/[₫,]/g, '')
      .replace(/\./g, (csvDelimiter === ',' ? '.' : ''))
    const num = parseFloat(normalized.replace(',', '.'))
    return isNaN(num) ? 0 : num
  }
  const normalizeTypeLabel = (raw: string) => {
    const s = String(raw || '').toLowerCase()
    if (s.includes('thu') || s.includes('income')) return 'income'
    return 'expense'
  }
  const handleParseCSV = async (file: File) => {
    setCsvErrors([])
    setCsvHeaders([])
    setCsvRows([])
    setCsvMapping({})
    setCsvDelimiter(null)
    const Papa: any = (await import('papaparse')).default
    return new Promise<void>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: csvEncoding,
        dynamicTyping: false,
        delimiter: csvDelimiter || undefined,
        complete: (results: any) => {
          const data = Array.isArray(results.data) ? results.data : []
          const headers = results.meta?.fields || (data.length > 0 ? Object.keys(data[0]) : [])
          setCsvHeaders(headers)
          setCsvRows(data)
          const mapping: Record<string, string> = {}
          headers.forEach((h: string) => {
            mapping[h] = guessField(h)
          })
          setCsvMapping(mapping)
          resolve()
        },
        error: (err: any) => {
          setCsvErrors(prev => [...prev, `Parse error: ${err.message || 'Unknown'}`])
          resolve()
        }
      })
    })
  }
  const buildTransactionFromRow = (row: any) => {
    const get = (field: string) => {
      const entry = Object.entries(csvMapping).find(([, v]) => v === field)
      if (!entry) return ''
      const [col] = entry
      return row[col]
    }
    const dateStr = String(get('date') || '').trim()
    const description = String(get('description') || '').trim()
    const category = String(get('category') || '').trim() || 'Khác'
    const wallet = String(get('wallet') || '').trim() || 'Thẻ chính'
    const amountVal = parseAmount(String(get('amount') || '0'))
    const typeLabel = normalizeTypeLabel(String(get('type') || ''))
    const notes = String(get('notes') || '').trim()
    const idVal = String(get('id') || '').trim()
    const date = dateStr
      ? new Date(dateStr).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    return {
      id: idVal || undefined,
      description,
      amount: Math.abs(amountVal),
      type: typeLabel as 'income' | 'expense',
      category,
      date,
      wallet,
      notes
    } as TransactionItem
  }
  const findDuplicate = (t: TransactionItem) => {
    return transactions.find(x =>
      (x.date || '').split('T')[0] === (t.date || '').split('T')[0] &&
      (x.description || '').toLowerCase() === (t.description || '').toLowerCase() &&
      Math.abs(x.amount || 0) === Math.abs(t.amount || 0) &&
      x.type === t.type
    )
  }
  const handleImportCSV = async () => {
    if (!csvRows || csvRows.length === 0) {
      alert('Chưa có dữ liệu CSV để import')
      return
    }
    try {
      setIsImporting(true)
      for (const row of csvRows) {
        const t = buildTransactionFromRow(row)
        const dup = findDuplicate(t)
        if (t.id || dup) {
          const id = t.id || dup?._id || dup?.id
          if (id) {
            await api.patch(`/transactions/${id}`, {
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.category,
              date: t.date,
              wallet: t.wallet,
              notes: t.notes
            })
            continue
          }
        }
        await api.post('/transactions', {
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date,
          wallet: t.wallet,
          notes: t.notes
        })
      }
      setCsvDialogOpen(false)
      setCsvFile(null)
      setCsvRows([])
      setCsvHeaders([])
      setCsvMapping({})
      fetchTransactions()
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Import CSV thất bại. Vui lòng kiểm tra lại dữ liệu.')
    } finally {
      setIsImporting(false)
    }
  }

  const categories = [
    'Tất cả', 'Thu nhập', 'Thực phẩm', 'Giải trí', 'Vận chuyển', 
    'Mua sắm', 'Hóa đơn', 'Y tế', 'Giáo dục', 'Đầu tư'
  ]


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Math.abs(amount))
  }

  const getAmountColor = (type?: string) => {
    return type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const formatAmount = (amount: number, type?: string) => {
    return type === 'income' ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Thu nhập': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Thực phẩm': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Giải trí': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Vận chuyển': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Mua sắm': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Hóa đơn': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Y tế': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Giáo dục': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Đầu tư': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  const filteredTransactions = transactions.filter((transaction: TransactionItem) => {
    const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(search.toLowerCase()) ||
                         transaction.wallet.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || filter === 'Tất cả' || transaction.category === filter
    return matchesSearch && matchesFilter
  })

  const totalIncome = transactions
    .filter((t: TransactionItem) => t.type === 'income')
    .reduce((sum: number, t: TransactionItem) => sum + (t.amount || 0), 0)

  const totalExpenses = transactions
    .filter((t: TransactionItem) => t.type === 'expense')
    .reduce((sum: number, t: TransactionItem) => sum + (t.amount || 0), 0)

  const netBalance = totalIncome - totalExpenses

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lịch sử Giao dịch</h1>
            <p className="text-muted-foreground">Theo dõi tất cả thu nhập và chi tiêu của bạn</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm giao dịch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm giao dịch mới</DialogTitle>
                <DialogDescription>
                  Thêm giao dịch thu nhập hoặc chi tiêu thủ công
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Loại</Label>
                    <Select 
                      value={newTransaction.type} 
                      onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Thu nhập</SelectItem>
                        <SelectItem value="expense">Chi tiêu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Số tiền (VND)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="0" 
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input 
                    id="description" 
                    placeholder="VD: Lương tháng, Ăn tối..." 
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                  {newAiSuggestion && (
                    <div className="mt-2 rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Gợi ý AI:</span>
                          <span className="font-medium">{newAiSuggestion.category}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {Math.round(newAiSuggestion.confidence)}% tin cậy
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewTransaction({ ...newTransaction, category: newAiSuggestion.category })}
                        >
                          Chấp nhận
                        </Button>
                      </div>
                      {newAiSuggestion.matchedKeywords.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Từ khoá khớp: {newAiSuggestion.matchedKeywords.join(', ')}
                        </div>
                      )}
                      {newAiList.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {newAiList.map((s, idx) => (
                            <Button
                              key={`${s.category}-${idx}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setNewTransaction({ ...newTransaction, category: s.category })}
                            >
                              {s.category} ({Math.round(s.confidence)}%)
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thực phẩm">Thực phẩm</SelectItem>
                      <SelectItem value="Vận chuyển">Vận chuyển</SelectItem>
                      <SelectItem value="Giải trí">Giải trí</SelectItem>
                      <SelectItem value="Mua sắm">Mua sắm</SelectItem>
                      <SelectItem value="Hóa đơn">Hóa đơn</SelectItem>
                      <SelectItem value="Thu nhập">Thu nhập</SelectItem>
                      <SelectItem value="Y tế">Y tế</SelectItem>
                      <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Ngày</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Ví</Label>
                  <Select 
                    value={newTransaction.wallet} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, wallet: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ví" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thẻ chính">Thẻ chính</SelectItem>
                      <SelectItem value="Tài khoản ngân hàng">Tài khoản ngân hàng</SelectItem>
                      <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                      <SelectItem value="MOMO">MOMO</SelectItem>
                      <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Tiết kiệm">Tiết kiệm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Ghi chú thêm..." 
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.description || !newTransaction.amount}
                >
                  Thêm giao dịch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng thu nhập</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {transactions.filter(t => t.amount > 0).length} giao dịch
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng chi tiêu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {transactions.filter(t => t.amount < 0).length} giao dịch
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Số dư ròng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netBalance)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Tổng {transactions.length} giao dịch
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Giao dịch gần đây</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm giao dịch..."
                    className="pl-9 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lọc theo danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AutoClassifyButton
                  transactions={transactions.map((t, idx) => ({
                    id: idx,
                    date: t.date,
                    description: t.description,
                    category: t.category,
                    amount: Math.abs(t.amount || 0),
                  }))}
                  onApplyClassification={handleApplyClassification}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Đang tải giao dịch...</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Ví</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction: TransactionItem) => (
                        <TableRow key={transaction._id || transaction.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(transaction.date).toLocaleDateString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(transaction.category)}>
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Wallet className="h-3 w-3 text-muted-foreground" />
                              {transaction.wallet}
                            </div>
                          </TableCell>
                        <TableCell className={`text-right font-medium ${getAmountColor(transaction.type)}`}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEdit(transaction)}>Sửa</DropdownMenuItem>
                            <DropdownMenuItem>Sao chép</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteTransaction(String(transaction._id || transaction.id || ''))}
                                >
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không tìm thấy giao dịch nào. Thử tìm kiếm hoặc lọc khác.
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {filteredTransactions.length} trên {transactions.length} giao dịch
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={transactions.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Xuất CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCsvDialogOpen(true)}
                    >
                      Import CSV
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Import giao dịch từ CSV</DialogTitle>
              <DialogDescription>
                Hỗ trợ kéo–thả, chọn mapping cột, xem trước và xác thực dữ liệu. Không ghi đè tự động.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center"
                onDragOver={(e) => { e.preventDefault() }}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer.files?.[0]
                  if (f) {
                    setCsvFile(f)
                    handleParseCSV(f)
                  }
                }}
              >
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setCsvFile(f)
                    if (f) handleParseCSV(f)
                  }}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  {csvFile ? csvFile.name : 'Chưa chọn file'}
                </div>
                <div className="mt-2 flex gap-2 items-center">
                  <span className="text-sm">Mã hoá:</span>
                  <Select value={csvEncoding} onValueChange={(v) => setCsvEncoding(v as any)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
                      <SelectItem value="utf-16">UTF-16</SelectItem>
                      <SelectItem value="windows-1258">Windows-1258</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm">Dấu phân cách:</span>
                  <Select value={csvDelimiter || 'auto'} onValueChange={(v) => setCsvDelimiter(v === 'auto' ? null : v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Tự động</SelectItem>
                      <SelectItem value=",">Dấu phẩy (,)</SelectItem>
                      <SelectItem value=";">Dấu chấm phẩy (;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {csvErrors.length > 0 && (
                <div className="text-red-600 text-sm">
                  {csvErrors.map((e, i) => (<div key={i}>{e}</div>))}
                </div>
              )}
              {csvHeaders.length > 0 && (
                <div className="space-y-3">
                  <div className="font-medium">Chọn mapping cột</div>
                  {csvHeaders.map((h) => (
                    <div key={h} className="flex items-center gap-3">
                      <div className="w-64 truncate">{h}</div>
                      <Select
                        value={csvMapping[h] || ''}
                        onValueChange={(v) => setCsvMapping(prev => ({ ...prev, [h]: v }))}
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder="Chọn trường dữ liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Bỏ qua</SelectItem>
                          <SelectItem value="date">Ngày</SelectItem>
                          <SelectItem value="description">Mô tả</SelectItem>
                          <SelectItem value="category">Danh mục</SelectItem>
                          <SelectItem value="wallet">Ví</SelectItem>
                          <SelectItem value="amount">Số tiền</SelectItem>
                          <SelectItem value="type">Loại</SelectItem>
                          <SelectItem value="notes">Ghi chú</SelectItem>
                          <SelectItem value="id">ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
              {csvRows.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium">Xem trước</div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Danh mục</TableHead>
                          <TableHead>Ví</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Ghi chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvRows.slice(0, 10).map((r, i) => {
                          const t = buildTransactionFromRow(r)
                          return (
                            <TableRow key={i}>
                              <TableCell>{t.date}</TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell>{t.category}</TableCell>
                              <TableCell>{t.wallet}</TableCell>
                              <TableCell>{formatCurrency(t.amount)}</TableCell>
                              <TableCell>{t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</TableCell>
                              <TableCell>{t.notes || ''}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hiển thị 10 dòng đầu trong tổng {csvRows.length} dòng.
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCsvDialogOpen(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={handleImportCSV}
                disabled={isImporting || csvRows.length === 0}
              >
                {isImporting ? 'Đang import...' : 'Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin giao dịch của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Loại</Label>
                  <Select 
                    value={editForm.type} 
                    onValueChange={(value) => setEditForm({...editForm, type: value as 'income' | 'expense'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Thu nhập</SelectItem>
                      <SelectItem value="expense">Chi tiêu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Số tiền (VND)</Label>
                  <Input 
                    id="edit-amount" 
                    type="number" 
                    placeholder="0" 
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Input 
                  id="edit-description" 
                  placeholder="VD: Lương tháng, Ăn tối..." 
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
                {editAiSuggestion && (
                  <div className="mt-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Gợi ý AI:</span>
                        <span className="font-medium">{editAiSuggestion.category}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {Math.round(editAiSuggestion.confidence)}% tin cậy
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditForm({ ...editForm, category: editAiSuggestion.category })}
                      >
                        Chấp nhận
                      </Button>
                    </div>
                    {editAiSuggestion.matchedKeywords.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Từ khoá khớp: {editAiSuggestion.matchedKeywords.join(', ')}
                      </div>
                    )}
                    {editAiList.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editAiList.map((s, idx) => (
                          <Button
                            key={`${s.category}-${idx}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditForm({ ...editForm, category: s.category })}
                          >
                            {s.category} ({Math.round(s.confidence)}%)
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Danh mục</Label>
                <Select 
                  value={editForm.category} 
                  onValueChange={(value) => setEditForm({...editForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thực phẩm">Thực phẩm</SelectItem>
                    <SelectItem value="Vận chuyển">Vận chuyển</SelectItem>
                    <SelectItem value="Giải trí">Giải trí</SelectItem>
                    <SelectItem value="Mua sắm">Mua sắm</SelectItem>
                    <SelectItem value="Hóa đơn">Hóa đơn</SelectItem>
                    <SelectItem value="Thu nhập">Thu nhập</SelectItem>
                    <SelectItem value="Y tế">Y tế</SelectItem>
                    <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Ngày</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-wallet">Ví</Label>
                <Select 
                  value={editForm.wallet} 
                  onValueChange={(value) => setEditForm({...editForm, wallet: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thẻ chính">Thẻ chính</SelectItem>
                    <SelectItem value="Tài khoản ngân hàng">Tài khoản ngân hàng</SelectItem>
                    <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                    <SelectItem value="MOMO">MOMO</SelectItem>
                    <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Tiết kiệm">Tiết kiệm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Ghi chú</Label>
                <Textarea 
                  id="edit-notes" 
                  placeholder="Ghi chú thêm..." 
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                onClick={handleUpdateTransaction}
                disabled={!editForm.description || !editForm.amount}
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}

export default Transactions
