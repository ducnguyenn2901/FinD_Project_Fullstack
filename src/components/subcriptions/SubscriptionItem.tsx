import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { MoreVertical, ExternalLink, AlertCircle, Calendar, Trash2, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { format, parseISO, addMonths, isBefore, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SubscriptionItemProps {
  id: string
  name: string
  amount: number
  billingCycle: string
  nextBillingDate: string
  category: string
  status: 'active' | 'cancelled' | 'pending'
  website?: string
  notes?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onUpdateStatus?: (id: string, status: string) => void
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  id,
  name,
  amount,
  billingCycle,
  nextBillingDate,
  category,
  status,
  website,
  notes,
  onEdit,
  onDelete,
  onUpdateStatus
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      entertainment: '🎬',
      streaming: '📺',
      software: '💻',
      productivity: '📊',
      health: '🏥',
      fitness: '💪',
      music: '🎵',
      news: '📰',
      education: '🎓',
      cloud: '☁️',
      other: '📦'
    }
    return icons[category] || '📦'
  }


  const getBillingCycleText = (cycle: string) => {
    const cycles: Record<string, string> = {
      daily: 'ngày',
      weekly: 'tuần',
      monthly: 'tháng',
      quarterly: 'quý',
      yearly: 'năm'
    }
    return cycles[cycle] || cycle
  }

  const calculateNextBillingDate = () => {
    try {
      const currentDate = new Date()
      const nextDate = parseISO(nextBillingDate)
      
      // If the next billing date is in the past, calculate the next one
      if (isBefore(nextDate, currentDate)) {
        const monthsToAdd = billingCycle === 'monthly' ? 1 :
                           billingCycle === 'quarterly' ? 3 :
                           billingCycle === 'yearly' ? 12 : 0
        
        if (monthsToAdd > 0) {
          return format(addMonths(nextDate, monthsToAdd), "dd/MM/yyyy", { locale: vi })
        }
      }
      
      return format(nextDate, "dd/MM/yyyy", { locale: vi })
    } catch {
      return nextBillingDate
    }
  }

  const getDaysUntilNextBilling = () => {
    try {
      const today = new Date()
      const nextDate = parseISO(nextBillingDate)
      const days = differenceInDays(nextDate, today)
      return days
    } catch {
      return null
    }
  }

  const daysUntilBilling = getDaysUntilNextBilling()
  const isUpcoming = daysUntilBilling !== null && daysUntilBilling <= 7 && status === 'active'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleEdit = () => {
    if (onEdit) onEdit(id)
  }

  const handleDelete = () => {
    if (onDelete && confirm(`Bạn có chắc chắn muốn xóa "${name}" không?`)) {
      onDelete(id)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (onUpdateStatus) onUpdateStatus(id, newStatus)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getCategoryIcon(category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{name}</h3>
                  <Badge className={getStatusColor(status)}>
                    {status === 'active' ? 'Đang hoạt động' : 
                     status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'}
                  </Badge>
                  {isUpcoming && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {daysUntilBilling === 0 ? 'Hôm nay' : 
                       daysUntilBilling === 1 ? 'Ngày mai' : 
                       `Còn ${daysUntilBilling} ngày`}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatCurrency(amount)}</span>
                    <span>/</span>
                    <span>{getBillingCycleText(billingCycle)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">Tiếp theo:</span>
                    <span>{calculateNextBillingDate()}</span>
                  </div>
                </div>

                {website && (
                  <a 
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-2"
                  >
                    {website.replace(/^https?:\/\//, '').split('/')[0]}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}

                {notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {status === 'active' ? (
                  <DropdownMenuItem 
                    className="text-yellow-600"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    Tạm dừng đăng ký
                  </DropdownMenuItem>
                ) : status === 'cancelled' ? (
                  <DropdownMenuItem 
                    className="text-green-600"
                    onClick={() => handleStatusChange('active')}
                  >
                    Kích hoạt lại
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionItem
