import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Progress } from '../components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Target, Gift, Shield, Sparkles, LogIn } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type PublicGoal = {
  name: string
  target_amount: number
  current_amount: number
}

type Wallet = {
  _id: string
  name: string
  balance: number
  type: string
}

const ContributeGoal = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [goal, setGoal] = useState<PublicGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedWalletId, setSelectedWalletId] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  // Fetch Goal Info
  useEffect(() => {
    const fetchGoal = async () => {
      if (!token) {
        setError('Liên kết không hợp lệ')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError('')
        const res = await api.get<PublicGoal>(`/goals/public/${token}`)
        setGoal(res.data)
      } catch {
        setError('Liên kết không hợp lệ hoặc đã bị tắt')
        setGoal(null)
      } finally {
        setLoading(false)
      }
    }
    fetchGoal()
  }, [token])

  // Fetch Wallets if user is logged in
  useEffect(() => {
    if (user) {
      const fetchWallets = async () => {
        try {
          const res = await api.get<Wallet[]>('/wallets')
          setWallets(res.data)
        } catch (e) {
          console.error('Failed to fetch wallets', e)
        }
      }
      fetchWallets()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !goal) return
    
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ')
      return
    }

    if (!selectedWalletId) {
      setError('Vui lòng chọn ví để thanh toán')
      return
    }

    const selectedWallet = wallets.find(w => w._id === selectedWalletId)
    if (selectedWallet && selectedWallet.balance < numericAmount) {
      setError('Số dư ví không đủ')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await api.post(`/goals/public/${token}/contributions`, {
        amount: numericAmount,
        wallet_id: selectedWalletId,
        note
      })
      const updated = await api.get<PublicGoal>(`/goals/public/${token}`)
      setGoal(updated.data)
      setSuccess(true)
      setAmount('')
      setNote('')
      // Refresh wallets to update balance
      const wRes = await api.get<Wallet[]>('/wallets')
      setWallets(wRes.data)
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Góp tiền thất bại, vui lòng thử lại'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = goal && goal.target_amount > 0
    ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
    : 0

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">FinD</span>
          </div>
          <p className="text-muted-foreground">
            Góp tiền để cùng người thân, bạn bè đạt mục tiêu tài chính nhanh hơn.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {loading ? 'Đang tải mục tiêu...' : goal ? goal.name : 'Mục tiêu không khả dụng'}
            </CardTitle>
            <CardDescription className="text-center">
              {goal
                ? `Mục tiêu này đang hướng tới ${formatCurrency(goal.target_amount)}. Mỗi đóng góp của bạn đều rất ý nghĩa.`
                : 'Vui lòng kiểm tra lại đường dẫn chia sẻ hoặc liên hệ với người gửi.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground text-sm">Đang tải thông tin mục tiêu...</p>
              </div>
            ) : error && !goal ? (
              <div className="text-center text-sm text-red-600 dark:text-red-400 py-4">
                {error}
              </div>
            ) : goal && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Đã góp</span>
                    <span className="font-medium">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tiến độ</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Thông tin thanh toán được bảo mật.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>Đóng góp từ ví của bạn.</span>
                    </div>
                  </div>
                </div>

                {success && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Gift className="h-4 w-4" />
                    <span>Cảm ơn bạn đã góp tiền cho mục tiêu này!</span>
                  </div>
                )}

                {error && goal && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {!user ? (
                  <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm">
                      <LogIn className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">Đăng nhập để góp tiền</h3>
                      <p className="text-sm text-muted-foreground">
                        Bạn cần đăng nhập và sử dụng ví của mình để đóng góp vào mục tiêu này.
                      </p>
                    </div>
                    <Button onClick={handleLoginRedirect} className="w-full">
                      Đăng nhập ngay
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Chọn ví thanh toán</Label>
                      <Select
                        value={selectedWalletId}
                        onValueChange={setSelectedWalletId}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ví nguồn" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.length === 0 ? (
                            <SelectItem value="__none" disabled>
                              Bạn chưa có ví nào
                            </SelectItem>
                          ) : (
                            wallets.map((w) => (
                              <SelectItem key={w._id} value={w._id}>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{w.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    ({formatCurrency(w.balance)})
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {wallets.length === 0 && (
                        <p className="text-xs text-red-500">
                          Vui lòng tạo ví trong trang quản lý ví trước khi góp tiền.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Số tiền muốn góp</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Nhập số tiền (VND)"
                        min={0}
                        disabled={submitting}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="note">Lời nhắn (tuỳ chọn)</Label>
                      <Input
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Gửi lời chúc đến chủ mục tiêu"
                        disabled={submitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting || !goal || !selectedWalletId}
                    >
                      {submitting ? 'Đang xử lý...' : 'Góp tiền ngay'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContributeGoal