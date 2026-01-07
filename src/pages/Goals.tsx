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
import { Target, Plus, TrendingUp, Calendar, Gift, Home, Car, Plane, GraduationCap } from 'lucide-react'
import api from '../lib/api'

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
  
  useEffect(() => {
    const id = setTimeout(() => {
      fetchGoals()
    }, 0)
    return () => clearTimeout(id)
  }, [fetchGoals])

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
  const overallProgress = (totalSaved / totalTarget) * 100

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      alert('Vui lòng điền đầy đủ thông tin')
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
    } catch (e) {
      console.error(e)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mục tiêu Tiết kiệm</h1>
          <p className="text-muted-foreground">Lập kế hoạch và theo dõi mục tiêu tài chính của bạn</p>
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
                <p className="text-2xl font-bold">
                  {Math.floor(totalTarget / goals.length)}
                </p>
                <p className="text-sm text-muted-foreground">Trung bình/mục tiêu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
          const daysLeft = getDaysUntilTarget(goal.targetDate)
          const monthlySaving = goal.targetAmount / Math.max(1, daysLeft / 30)
          
          return (
            <Card key={goal._id || goal.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full ${goal.color}`}>
                    {goal.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Hoàn thành</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{goal.name}</h3>
                
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
    </div>
  )
}

export default Goals
