import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { AlertTriangle, TrendingDown, Brain, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import SubscriptionItem from '../components/subcriptions/SubscriptionItem'
import AddSubscriptionDialog from '../components/subcriptions/AddSubscriptionDialog'

const Subscriptions = () => {
  const { user } = useAuth()
  type Subscription = {
    _id?: string
    id?: string
    name: string
    amount: number
    billing_cycle: string
    next_billing_date: string
    category: string
    status: 'active' | 'cancelled' | 'pending'
    website?: string
    notes?: string
  }
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState<{
    monthlyCost: number
    potentialSavings: number
    duplicateServices: { name: string; services: string[]; savings: number }[]
    recommendations: string[]
    unusedServices: string[]
  } | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editSub, setEditSub] = useState<Subscription | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBillingDate: '',
    category: 'other',
    status: 'active' as 'active' | 'cancelled' | 'pending',
    website: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions')
      setSubscriptions(res.data || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = useCallback(() => {
    const active = subscriptions.filter(s => s.status === 'active')
    const monthly = active.reduce((sum, s) => sum + (s.amount || 0), 0)
    const videoKeywords = ['netflix', 'disney', 'youtube', 'prime', 'hulu']
    const musicKeywords = ['spotify', 'apple music', 'yt music', 'deezer', 'zmp3']
    const groupByKeywords = (keys: string[]) => {
      return active.filter(s => {
        const name = (s.name || '').toLowerCase()
        return keys.some(k => name.includes(k))
      })
    }
    const video = groupByKeywords(videoKeywords)
    const music = groupByKeywords(musicKeywords)
    const duplicateServices: { name: string; services: string[]; savings: number }[] = []
    if (video.length > 1) {
      const savings = Math.min(...video.map(s => s.amount || 0))
      duplicateServices.push({ name: 'Video Streaming', services: video.map(s => s.name), savings })
    }
    if (music.length > 1) {
      const savings = Math.min(...music.map(s => s.amount || 0))
      duplicateServices.push({ name: 'Music Streaming', services: music.map(s => s.name), savings })
    }
    const potentialSavings = duplicateServices.reduce((sum, d) => sum + (d.savings || 0), 0)
    const recommendations: string[] = []
    duplicateServices.forEach(d => {
      recommendations.push(`Xem xét hủy bớt dịch vụ trong nhóm ${d.name}`)
    })
    setAiInsights({
      monthlyCost: monthly,
      potentialSavings,
      duplicateServices,
      recommendations,
      unusedServices: []
    })
  }, [subscriptions])

  useEffect(() => {
    generateAIInsights()
  }, [generateAIInsights])

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled')
  const monthlyCost = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)

  const getUpcomingSubscriptions = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return activeSubscriptions.filter(sub => 
      new Date(sub.next_billing_date) <= nextWeek
    )
  }

  const openEdit = (id: string) => {
    const sub = subscriptions.find(s => (s._id || s.id) === id)
    if (!sub) return
    setEditSub(sub)
    setEditForm({
      name: sub.name,
      amount: String(sub.amount || 0),
      billingCycle: sub.billing_cycle,
      nextBillingDate: sub.next_billing_date,
      category: sub.category,
      status: sub.status,
      website: sub.website || '',
      notes: sub.notes || ''
    })
    setEditOpen(true)
  }

  const handleUpdateSubscription = async () => {
    if (!editSub) return
    try {
      const id = editSub._id || editSub.id
      const amount = parseFloat(editForm.amount)
      if (isNaN(amount)) {
        alert('Vui lòng nhập số tiền hợp lệ')
        return
      }
      await api.patch(`/subscriptions/${id}`, {
        name: editForm.name,
        amount,
        billing_cycle: editForm.billingCycle,
        next_billing_date: editForm.nextBillingDate,
        category: editForm.category,
        status: editForm.status,
        website: editForm.website,
        notes: editForm.notes
      })
      setEditOpen(false)
      setEditSub(null)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Không thể cập nhật đăng ký. Vui lòng thử lại.')
    }
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Đăng ký</h1>
            <p className="text-muted-foreground">Theo dõi và tối ưu hóa chi phí đăng ký</p>
          </div>
          <AddSubscriptionDialog onSuccess={fetchSubscriptions} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chi phí hàng tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyCost.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">{activeSubscriptions.length} dịch vụ đang hoạt động</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đề xuất tiết kiệm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${aiInsights?.potentialSavings?.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Tiềm năng tiết kiệm hàng tháng</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đến hạn trong tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUpcomingSubscriptions().length}</div>
              <p className="text-sm text-muted-foreground">Dịch vụ sắp gia hạn</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle>Phân tích AI & Đề xuất tiết kiệm</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Potential Savings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tiềm năng tiết kiệm hàng tháng</span>
                  <span className="font-bold text-green-600">${aiInsights.potentialSavings.toFixed(2)}</span>
                </div>
                <Progress value={(aiInsights.potentialSavings / aiInsights.monthlyCost) * 100} className="h-2" />
              </div>

              {/* Duplicate Services */}
              {aiInsights.duplicateServices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-semibold">Dịch vụ trùng lặp được phát hiện</h4>
                  </div>
                  {aiInsights.duplicateServices.map((dup: { name: string; services: string[]; savings: number }, index: number) => (
                    <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{dup.name}</span>
                        <span className="text-green-600 font-semibold">Tiết kiệm ${dup.savings}/tháng</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dup.services.join(' và ')} - Xem xét hủy bớt một dịch vụ
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">Đề xuất tối ưu hóa</h4>
                </div>
                <ul className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unused Services */}
              {aiInsights.unusedServices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <h4 className="font-semibold">Dịch vụ ít sử dụng</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.unusedServices.map((service: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                Xem phân tích chi tiết
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions Tabs */}
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Đang tải đăng ký...</div>
        ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Đang hoạt động ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Đã hủy ({cancelledSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">Lịch thanh toán</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeSubscriptions.map((subscription: Subscription) => (
              <SubscriptionItem
                key={String(subscription._id || subscription.id || '')}
                id={String(subscription._id || subscription.id || '')}
                name={subscription.name}
                amount={subscription.amount}
                billingCycle={subscription.billing_cycle}
                nextBillingDate={subscription.next_billing_date}
                category={subscription.category}
                status={subscription.status}
                website={subscription.website}
                notes={subscription.notes}
                onEdit={openEdit}
                onUpdateStatus={async (id, status) => {
                  await api.patch(`/subscriptions/${id}`, { status })
                  fetchSubscriptions()
                }}
                onDelete={async (id) => {
                  await api.delete(`/subscriptions/${id}`)
                  fetchSubscriptions()
                }}
              />
            ))}
            
            {activeSubscriptions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Chưa có đăng ký nào</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {cancelledSubscriptions.map((subscription: Subscription) => (
              <SubscriptionItem
                key={String(subscription._id || subscription.id || '')}
                id={String(subscription._id || subscription.id || '')}
                name={subscription.name}
                amount={subscription.amount}
                billingCycle={subscription.billing_cycle}
                nextBillingDate={subscription.next_billing_date}
                category={subscription.category}
                status={subscription.status}
                website={subscription.website}
                notes={subscription.notes}
                onEdit={openEdit}
                onUpdateStatus={async (id, status) => {
                  await api.patch(`/subscriptions/${id}`, { status })
                  fetchSubscriptions()
                }}
                onDelete={async (id) => {
                  await api.delete(`/subscriptions/${id}`)
                  fetchSubscriptions()
                }}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Lịch thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Calendar component would go here */}
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Calendar view coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đăng ký</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin dịch vụ đăng ký
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên dịch vụ</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Số tiền</Label>
                  <Input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Chu kỳ</Label>
                  <Select
                    value={editForm.billingCycle}
                    onValueChange={(v) => setEditForm({ ...editForm, billingCycle: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly">Hàng quý</SelectItem>
                      <SelectItem value="yearly">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày tiếp theo</Label>
                  <Input
                    type="date"
                    value={editForm.nextBillingDate}
                    onChange={(e) => setEditForm({ ...editForm, nextBillingDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v: 'active' | 'cancelled' | 'pending') => setEditForm({ ...editForm, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="pending">Đang chờ</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Danh mục</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entertainment">Giải trí</SelectItem>
                    <SelectItem value="streaming">Phát trực tuyến</SelectItem>
                    <SelectItem value="software">Phần mềm</SelectItem>
                    <SelectItem value="productivity">Năng suất</SelectItem>
                    <SelectItem value="health">Sức khỏe</SelectItem>
                    <SelectItem value="fitness">Thể hình</SelectItem>
                    <SelectItem value="music">Âm nhạc</SelectItem>
                    <SelectItem value="news">Tin tức</SelectItem>
                    <SelectItem value="education">Giáo dục</SelectItem>
                    <SelectItem value="cloud">Lưu trữ đám mây</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ghi chú</Label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSubscription}>Lưu thay đổi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}

export default Subscriptions
