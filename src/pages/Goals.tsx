import React, { useEffect, useState, type JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
import { Target, Plus, TrendingUp, Calendar, Gift, Home, Car, Plane, GraduationCap, Wallet, Share2, Trash2 } from 'lucide-react'
import api from '../lib/api'
import {
  Dialog as ContributionDialog,
  DialogContent as ContributionDialogContent,
  DialogHeader as ContributionDialogHeader,
  DialogTitle as ContributionDialogTitle,
  DialogDescription as ContributionDialogDescription,
  DialogFooter as ContributionDialogFooter
} from "../components/ui/dialog"
import {
  Select as WalletSelect,
  SelectTrigger as WalletSelectTrigger,
  SelectValue as WalletSelectValue,
  SelectContent as WalletSelectContent,
  SelectItem as WalletSelectItem
} from "../components/ui/select"
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'

type GoalResponse = {
  _id?: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
}

type Goal = {
  _id?: string
  id?: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  icon: JSX.Element
  color: string
  category: string
}

type WalletItem = {
  id?: string
  name: string
  type: string
}

type ContributionItem = {
  amount: number
  contributor_name?: string
  wallet_name?: string
  wallet_type?: string
  note?: string
  created_at?: string
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  })

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'other'
  })

  const [wallets, setWallets] = useState<WalletItem[]>([])
  const [contributionOpen, setContributionOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [contributionForm, setContributionForm] = useState({
    amount: '',
    walletId: '',
    note: ''
  })
  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null)
  
  // Delete Dialog State
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState<ContributionItem[]>([])
  const [historyGoalName, setHistoryGoalName] = useState('')

  const getIconByCategory = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      travel: <Plane className="h-6 w-6" />,
      vehicle: <Car className="h-6 w-6" />,
      home: <Home className="h-6 w-6" />,
      education: <GraduationCap className="h-6 w-6" />,
      gift: <Gift className="h-6 w-6" />,
      other: <Target className="h-6 w-6" />
    }
    return icons[category] || <Target className="h-6 w-6" />
  }

  const getColorByCategory = (category: string) => {
    const colors: Record<string, string> = {
      travel: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      vehicle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      home: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      education: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const fetchGoals = React.useCallback(async () => {
    try {
      const res = await api.get('/goals')
      const items = ((res.data || []) as GoalResponse[]).map((g) => ({
        _id: g._id,
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        targetDate: g.deadline || '',
        icon: getIconByCategory('other'),
        color: getColorByCategory('other'),
        category: 'other'
      }))
      setGoals(items)
    } catch (e) {
      console.error(e)
    }
  }, [])
  
  const fetchWallets = React.useCallback(async () => {
    try {
      const res = await api.get('/wallets')
      const data = (res.data || []) as Array<WalletItem & { _id: string }>
      setWallets(data.map(d => ({ id: d._id, name: d.name, type: d.type })))
    } catch (e) {
      console.error(e)
    }
  }, [])
  
  useEffect(() => {
    const id = setTimeout(() => {
      fetchGoals()
      fetchWallets()
    }, 0)
    return () => clearTimeout(id)
  }, [fetchGoals, fetchWallets])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100
  }

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const averageTarget = goals.length > 0 ? totalTarget / goals.length : 0

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      toast.error('Vui lòng điền đầy đủ thông tin mục tiêu')
      return
    }

    const payload = {
      name: newGoal.name,
      target_amount: parseInt(newGoal.targetAmount),
      current_amount: 0,
      deadline: newGoal.targetDate
    }
    try {
      await api.post('/goals', payload)
      setNewGoal({ name: '', targetAmount: '', targetDate: '', category: 'other' })
      fetchGoals()
      toast.success('Tạo mục tiêu tiết kiệm thành công')
    } catch (e) {
      console.error(e)
      toast.error('Tạo mục tiêu thất bại, vui lòng thử lại')
    }
  }

  

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => (g._id || g.id) === id)
    if (!goal) return
    const updated = {
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount + amount,
      deadline: goal.targetDate
    }
    try {
      await api.patch(`/goals/${id}`, updated)
      fetchGoals()
    } catch (e) {
      console.error(e)
    }
  }

  const openContributionDialog = (goalId: string) => {
    setSelectedGoalId(goalId)
    setContributionForm({ amount: '', walletId: '', note: '' })
    setContributionOpen(true)
  }

  const handleContribute = async () => {
    if (!selectedGoalId) return
    const amountNumber = parseInt(contributionForm.amount)
    if (!amountNumber || amountNumber <= 0) {
      toast.error('Vui lòng nhập số tiền góp hợp lệ')
      return
    }

    const wallet = wallets.find(w => w.id === contributionForm.walletId)

    try {
      await api.post(`/goals/${selectedGoalId}/contributions`, {
        amount: amountNumber,
        wallet_name: wallet?.name || '',
        wallet_type: wallet?.type || '',
        note: contributionForm.note
      })
      setContributionOpen(false)
      setSelectedGoalId(null)
      fetchGoals()
    } catch (e) {
      console.error(e)
      toast.error('Góp tiền vào mục tiêu thất bại, vui lòng thử lại')
    }
  }

  const handleShareLink = async (goalId: string) => {
    try {
      setShareLoadingId(goalId)
      const res = await api.post<{ ok: boolean; shareUrl: string }>(`/goals/${goalId}/share`)
      const shareUrl = res.data?.shareUrl
      if (shareUrl) {
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link chia sẻ đã được sao chép vào bộ nhớ tạm')
        } catch {
          toast.info(`Link chia sẻ: ${shareUrl}`)
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Tạo link chia sẻ thất bại, vui lòng thử lại')
    } finally {
      setShareLoadingId(null)
    }
  }

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return
    try {
      await api.delete(`/goals/${goalToDelete}`)
      toast.success('Đã xóa mục tiêu thành công')
      setDeleteGoalOpen(false)
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Không thể xóa mục tiêu')
    }
  }

  const openHistoryDialog = async (goal: Goal) => {
    const id = goal._id || goal.id
    if (!id) return
    setHistoryGoalName(goal.name)
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const res = await api.get<ContributionItem[]>(`/goals/${id}/contributions`)
      setHistoryItems(res.data || [])
    } catch (e) {
      console.error(e)
      setHistoryItems([])
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mục tiêu Tiết kiệm</h1>
          <p className="text-muted-foreground">
            Lập kế hoạch và theo dõi hành trình tiết kiệm cho những mục tiêu quan trọng.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tạo mục tiêu mới</DialogTitle>
              <DialogDescription>
                Thêm mục tiêu tiết kiệm và bắt đầu lập kế hoạch
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên mục tiêu *</Label>
                <Input 
                  id="name" 
                  placeholder="VD: Du lịch, Mua nhà..." 
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Số tiền mục tiêu *</Label>
                <Input 
                  id="target" 
                  type="number" 
                  placeholder="0"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Ngày hoàn thành mục tiêu *</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select 
                  value={newGoal.category}
                  onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Du lịch</SelectItem>
                    <SelectItem value="vehicle">Xe cộ</SelectItem>
                    <SelectItem value="home">Nhà cửa</SelectItem>
                    <SelectItem value="education">Giáo dục</SelectItem>
                    <SelectItem value="gift">Quà tặng</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGoal}>Tạo mục tiêu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tổng quan Tiết kiệm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tổng tiến độ</span>
                <span className="font-bold">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Đã tiết kiệm</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mục tiêu tổng</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Mục tiêu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {goals.filter(g => calculateProgress(g.currentAmount, g.targetAmount) >= 100).length}
                </p>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              </div>
              <div className="text-center">
                    <p className="text-lg font-bold">
                      {formatCurrency(averageTarget)}
                    </p>
                    <p className="text-sm text-muted-foreground">Mục tiêu trung bình</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <Target className="h-10 w-10 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Chưa có mục tiêu tiết kiệm nào</p>
              <p className="text-sm text-muted-foreground">
                Tạo mục tiêu đầu tiên để bắt đầu hành trình tiết kiệm thông minh.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo mục tiêu đầu tiên
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tạo mục tiêu mới</DialogTitle>
                  <DialogDescription>
                    Thêm mục tiêu tiết kiệm và bắt đầu lập kế hoạch.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="empty-name">Tên mục tiêu *</Label>
                    <Input
                      id="empty-name"
                      placeholder="VD: Du lịch, Mua nhà..."
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="empty-target">Số tiền mục tiêu *</Label>
                    <Input
                      id="empty-target"
                      type="number"
                      placeholder="0"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="empty-date">Ngày hoàn thành mục tiêu *</Label>
                    <Input
                      id="empty-date"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddGoal}>Tạo mục tiêu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
            const daysLeft = getDaysUntilTarget(goal.targetDate)
            const monthlySaving = goal.targetAmount / Math.max(1, daysLeft / 30)
            
            return (
            <Card
              key={goal._id || goal.id}
              className={`hover:shadow-lg transition-shadow ${
                progress >= 100 ? 'border-green-300 dark:border-green-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full ${goal.color}`}>
                    {goal.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Hoàn thành</div>
                    {progress >= 100 && (
                      <Badge className="mt-1" variant="outline">
                        Đã đạt mục tiêu
                      </Badge>
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 truncate" title={goal.name}>{goal.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Đã tiết kiệm</span>
                      <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm mt-1">
                      <span>Mục tiêu</span>
                      <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Còn {daysLeft} ngày</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>Cần {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Tiết kiệm hàng tháng:</span>
                      <span className="font-medium">{formatCurrency(monthlySaving)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => addToGoal(String(goal._id || goal.id || ''), 1000000)}
                    >
                      +1 triệu
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm"
                      onClick={() => addToGoal(String(goal._id || goal.id || ''), 5000000)}
                    >
                      +5 triệu
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditGoal(goal)
                        setEditForm({
                          name: goal.name,
                          targetAmount: String(goal.targetAmount),
                          targetDate: goal.targetDate
                        })
                        setEditOpen(true)
                      }}
                    >
                      Sửa
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        setGoalToDelete(String(goal._id || goal.id))
                        setDeleteGoalOpen(true)
                      }}
                      title="Xóa mục tiêu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openContributionDialog(String(goal._id || goal.id || ''))}
                    >
                      <Wallet className="h-4 w-4 mr-1" />
                      Góp tiền từ ví
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleShareLink(String(goal._id || goal.id || ''))}
                      disabled={shareLoadingId === String(goal._id || goal.id || '')}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      {shareLoadingId === String(goal._id || goal.id || '') ? 'Đang tạo link...' : 'Chia sẻ link góp'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openHistoryDialog(goal)}
                    >
                      Lịch sử góp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      {/* Savings Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Mẹo đạt mục tiêu nhanh hơn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                tip: "Tự động hóa tiết kiệm",
                description: "Cài đặt chuyển khoản tự động vào tài khoản tiết kiệm mỗi tháng",
                example: "Tự động chuyển 10% lương vào ngày nhận lương"
              },
              {
                tip: "Cắt giảm chi phí không cần thiết",
                description: "Xem xét hủy các đăng ký dịch vụ không sử dụng",
                example: "Hủy 2 dịch vụ streaming = tiết kiệm 300K/tháng"
              },
              {
                tip: "Tăng thu nhập phụ",
                description: "Tìm thêm nguồn thu nhập phụ để tăng tốc tiết kiệm",
                example: "Freelance, bán đồ cũ, chia sẻ kiến thức"
              }
            ].map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <h4 className="font-semibold">{item.tip}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  💡 {item.example}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteGoalOpen} onOpenChange={setDeleteGoalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mục tiêu này và toàn bộ lịch sử đóng góp sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal} className="bg-red-600 hover:bg-red-700">
              Xóa mục tiêu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mục tiêu</DialogTitle>
            <DialogDescription>
              Cập nhật tên, số tiền mục tiêu và ngày hoàn thành
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên mục tiêu</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Số tiền mục tiêu</Label>
              <Input
                type="number"
                value={editForm.targetAmount}
                onChange={(e) => setEditForm({ ...editForm, targetAmount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngày hoàn thành</Label>
              <Input
                type="date"
                value={editForm.targetDate}
                onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!editGoal) return
                try {
                  const id = editGoal._id || editGoal.id
                  await api.patch(`/goals/${id}`, {
                    name: editForm.name,
                    target_amount: parseInt(editForm.targetAmount) || 0,
                    current_amount: editGoal.currentAmount,
                    deadline: editForm.targetDate
                  })
                  setEditOpen(false)
                  setEditGoal(null)
                  fetchGoals()
                } catch (e) {
                  console.error(e)
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ContributionDialog open={contributionOpen} onOpenChange={setContributionOpen}>
        <ContributionDialogContent className="sm:max-w-[425px]">
          <ContributionDialogHeader>
            <ContributionDialogTitle>Góp tiền vào mục tiêu</ContributionDialogTitle>
            <ContributionDialogDescription>
              Chọn ví và số tiền bạn muốn góp vào mục tiêu này.
            </ContributionDialogDescription>
          </ContributionDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Chọn ví</Label>
              <WalletSelect
                value={contributionForm.walletId}
                onValueChange={(value) => setContributionForm({ ...contributionForm, walletId: value })}
              >
                <WalletSelectTrigger>
                  <WalletSelectValue placeholder="Chọn ví nguồn" />
                </WalletSelectTrigger>
                <WalletSelectContent>
                  {wallets.length === 0 ? (
                    <WalletSelectItem value="__none" disabled>
                      Chưa có ví nào, hãy tạo ví trước
                    </WalletSelectItem>
                  ) : (
                    wallets.map((w) => (
                      <WalletSelectItem key={w.id} value={w.id || ''}>
                        {w.name}
                      </WalletSelectItem>
                    ))
                  )}
                </WalletSelectContent>
              </WalletSelect>
            </div>
            <div className="grid gap-2">
              <Label>Số tiền góp</Label>
              <Input
                type="number"
                value={contributionForm.amount}
                onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                placeholder="Nhập số tiền (VND)"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ghi chú (tuỳ chọn)</Label>
              <Input
                value={contributionForm.note}
                onChange={(e) => setContributionForm({ ...contributionForm, note: e.target.value })}
                placeholder="Ví dụ: Góp từ ví MOMO"
              />
            </div>
          </div>
          <ContributionDialogFooter>
            <Button onClick={handleContribute}>
              Xác nhận góp tiền
            </Button>
          </ContributionDialogFooter>
        </ContributionDialogContent>
      </ContributionDialog>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Lịch sử góp tiền</DialogTitle>
            <DialogDescription>
              Các lần góp tiền vào mục tiêu {historyGoalName}.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-80 overflow-y-auto">
            {historyLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Đang tải lịch sử góp tiền...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Chưa có lần góp tiền nào cho mục tiêu này.
              </div>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item, index) => {
                  const date = item.created_at ? new Date(item.created_at) : null
                  const source =
                    item.wallet_type === 'external'
                      ? 'Góp công khai'
                      : item.wallet_name
                      ? `Từ ví ${item.wallet_name}`
                      : 'Khác'
                  const name = item.contributor_name && item.contributor_name.trim()
                    ? item.contributor_name
                    : 'Không tên'
                  return (
                    <div
                      key={`${item.created_at || ''}-${index}`}
                      className="flex justify-between items-start rounded-md border bg-card px-3 py-2 text-sm"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {source} • Người góp: {name}
                        </div>
                        {item.note && item.note.trim() && (
                          <div className="text-xs text-muted-foreground">
                            Lời nhắn: {item.note}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {date ? date.toLocaleString('vi-VN') : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Goals
