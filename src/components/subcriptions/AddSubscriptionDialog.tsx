// src/../subscriptions/AddSubscriptionDialog.tsx
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Calendar } from '../ui/calendar'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '../ui/utils'
import api from '../../lib/api'

interface AddSubscriptionDialogProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

const AddSubscriptionDialog: React.FC<AddSubscriptionDialogProps> = ({ 
  onSuccess,
  trigger 
}) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = React.useState<Date>()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    category: 'entertainment',
    website: '',
    notes: '',
    status: 'active'
  })

  const billingCycles = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'quarterly', label: 'Hàng quý' },
    { value: 'yearly', label: 'Hàng năm' },
  ]

  const categories = [
    { value: 'entertainment', label: 'Giải trí', icon: '🎬' },
    { value: 'streaming', label: 'Phát trực tuyến', icon: '📺' },
    { value: 'software', label: 'Phần mềm', icon: '💻' },
    { value: 'productivity', label: 'Năng suất', icon: '📊' },
    { value: 'health', label: 'Sức khỏe', icon: '🏥' },
    { value: 'fitness', label: 'Thể hình', icon: '💪' },
    { value: 'music', label: 'Âm nhạc', icon: '🎵' },
    { value: 'news', label: 'Tin tức', icon: '📰' },
    { value: 'education', label: 'Giáo dục', icon: '🎓' },
    { value: 'cloud', label: 'Lưu trữ đám mây', icon: '☁️' },
    { value: 'other', label: 'Khác', icon: '📦' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Vui lòng nhập tên dịch vụ')
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ')
      }
      if (!date) {
        throw new Error('Vui lòng chọn ngày thanh toán tiếp theo')
      }

      await api.post('/subscriptions', {
        name: formData.name,
        amount: parseFloat(formData.amount),
        billing_cycle: formData.billingCycle,
        category: formData.category,
        website: formData.website,
        notes: formData.notes,
        status: formData.status,
        next_billing_date: date.toISOString().split('T')[0]
      })

      // Reset form
      setFormData({
        name: '',
        amount: '',
        billingCycle: 'monthly',
        category: 'entertainment',
        website: '',
        notes: '',
        status: 'active'
      })
      setDate(undefined)

      // Close dialog
      setOpen(false)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Error adding subscription:', error)
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCurrency = (value: string) => {
    if (!value) return ''
    const number = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(number)) return ''
    return new Intl.NumberFormat('vi-VN').format(number)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '')
    setFormData(prev => ({
      ...prev,
      amount: rawValue
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm đăng ký mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Thêm đăng ký dịch vụ mới</DialogTitle>
          <DialogDescription>
            Thêm dịch vụ đăng ký định kỳ để theo dõi chi phí hàng tháng
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Service Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên dịch vụ *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Netflix, Spotify Premium, Adobe Creative Cloud..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="grid gap-2">
                <Label htmlFor="amount">Số tiền *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    value={formatCurrency(formData.amount)}
                    onChange={handleAmountChange}
                    className="pl-8"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Billing Cycle */}
              <div className="grid gap-2">
                <Label htmlFor="billingCycle">Chu kỳ thanh toán *</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => handleSelectChange('billingCycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="pending">Đang chờ</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Next Billing Date */}
            <div className="grid gap-2">
              <Label>Ngày thanh toán tiếp theo *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="website">Website (tùy chọn)</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://..."
                type="url"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ghi chú thêm về dịch vụ..."
                rows={3}
              />
            </div>

            {/* Preview */}
            {formData.name && formData.amount && (
              <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Xem trước:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dịch vụ:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chi phí:</span>
                    <span className="font-medium">
                      {formatCurrency(formData.amount)}₫ / {
                        billingCycles.find(b => b.value === formData.billingCycle)?.label.toLowerCase()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày tiếp theo:</span>
                    <span className="font-medium">
                      {date ? format(date, "dd/MM/yyyy", { locale: vi }) : 'Chưa chọn'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang thêm...
                </>
              ) : (
                'Thêm đăng ký'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubscriptionDialog
