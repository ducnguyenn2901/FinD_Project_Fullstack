import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Badge } from '../components/ui/badge'
import { Plus, Wallet, CreditCard, Smartphone, Building, Trash2, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext' // ← Đây là object đã được tạo sẵn
import api from '../lib/api'
import { toast } from 'sonner'

type WalletItem = {
  id?: string
  user_id?: string
  name: string
  type: 'bank' | 'momo' | 'zalopay' | 'credit_card' | 'cash' | string
  balance: number
  currency: string
  created_at?: string
}

const Wallets = () => {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<WalletItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'bank',
    balance: '',
    currency: 'VND'
  })

  const [editOpen, setEditOpen] = useState(false)
  const [editWallet, setEditWallet] = useState<WalletItem | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'bank',
    balance: '',
    currency: 'VND'
  })
  

  const fetchWallets = useCallback(async () => {
    try {
      const res = await api.get('/wallets')
      const data = (res.data || []) as Array<WalletItem & { _id: string }>
      setWallets(data.map(d => ({ ...d, id: d._id })) as WalletItem[])
    } catch (error) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchWallets()
    }
  }, [user, fetchWallets])

  const handleAddWallet = async () => {
    try {
      await api.post('/wallets', {
        name: newWallet.name,
        type: newWallet.type,
        balance: parseFloat(newWallet.balance) || 0,
        currency: newWallet.currency
      })
      setNewWallet({ name: '', type: 'bank', balance: '', currency: 'VND' })
      fetchWallets()
      toast.success('Thêm ví thành công')
    } catch {
      toast.error('Thêm ví thất bại')
    }
  }

  const openEdit = (w: WalletItem) => {
    setEditWallet(w)
    setEditForm({
      name: w.name,
      type: String(w.type || 'bank'),
      balance: String(w.balance ?? ''),
      currency: w.currency || 'VND'
    })
    setEditOpen(true)
  }

  const handleUpdateWallet = async () => {
    if (!editWallet?.id) return
    try {
      await api.patch(`/wallets/${editWallet.id}`, {
        name: editForm.name,
        type: editForm.type,
        balance: parseFloat(editForm.balance) || 0,
        currency: editForm.currency
      })
      setEditOpen(false)
      setEditWallet(null)
      toast.success('Cập nhật ví thành công')
      fetchWallets()
    } catch {
      toast.error('Cập nhật ví thất bại')
    }
  }

  const handleDeleteWallet = async (id?: string) => {
    if (!id) return
    const ok = window.confirm('Bạn có chắc muốn xóa ví này?')
    if (!ok) return
    try {
      await api.delete(`/wallets/${id}`)
      toast.success('Xóa ví thành công')
      fetchWallets()
    } catch {
      toast.error('Xóa ví thất bại')
    }
  }

  const getWalletIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      bank: <Building className="h-6 w-6" />,
      momo: <Smartphone className="h-6 w-6" />,
      zalopay: <Smartphone className="h-6 w-6" />,
      credit_card: <CreditCard className="h-6 w-6" />,
      cash: <Wallet className="h-6 w-6" />
    }
    return icons[type] || <Wallet className="h-6 w-6" />
  }

  const getWalletColor = (type: string) => {
    const colors: Record<string, string> = {
      bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      momo: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      zalopay: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      credit_card: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      cash: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Ví</h1>
            <p className="text-muted-foreground">Theo dõi tất cả tài khoản của bạn</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ví mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm ví mới</DialogTitle>
                <DialogDescription>
                  Thêm ví điện tử, tài khoản ngân hàng hoặc ví tiền mặt.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên ví</Label>
                  <Input
                    id="name"
                    placeholder="Ví MOMO, Vietcombank, ..."
                    value={newWallet.name}
                    onChange={(e) => setNewWallet({...newWallet, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Loại ví</Label>
                  <Select value={newWallet.type} onValueChange={(value) => setNewWallet({...newWallet, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại ví" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momo">MOMO</SelectItem>
                      <SelectItem value="zalopay">ZaloPay</SelectItem>
                      <SelectItem value="bank">Ngân hàng</SelectItem>
                      <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="balance">Số dư hiện tại</Label>
                  <Input
                    id="balance"
                    type="number"
                    placeholder="0"
                    value={newWallet.balance}
                    onChange={(e) => setNewWallet({...newWallet, balance: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">Tiền tệ</Label>
                  <Select value={newWallet.currency} onValueChange={(value) => setNewWallet({...newWallet, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleAddWallet}>
                  Thêm Ví
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa Ví</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin ví của bạn.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Tên ví</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ví MOMO, Vietcombank, ..."
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Loại ví</Label>
                  <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại ví" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momo">MOMO</SelectItem>
                      <SelectItem value="zalopay">ZaloPay</SelectItem>
                      <SelectItem value="bank">Ngân hàng</SelectItem>
                      <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-balance">Số dư hiện tại</Label>
                  <Input
                    id="edit-balance"
                    type="number"
                    placeholder="0"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-currency">Tiền tệ</Label>
                  <Select value={editForm.currency} onValueChange={(value) => setEditForm({ ...editForm, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => setEditOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateWallet}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance, 'VND')}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Tổng cộng {wallets.length} ví
            </p>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground mt-2">Đang tải ví...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getWalletColor(wallet.type)}`}>
                          {getWalletIcon(wallet.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{wallet.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {wallet.type === 'momo' ? 'MOMO' : 
                             wallet.type === 'zalopay' ? 'ZaloPay' : 
                             wallet.type === 'bank' ? 'Ngân hàng' : 
                             wallet.type === 'credit_card' ? 'Thẻ tín dụng' : 'Tiền mặt'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cập nhật: {new Date(wallet.created_at ?? Date.now()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(wallet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteWallet(wallet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {wallets.length === 0 && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có ví nào</h3>
              <p className="text-muted-foreground mb-4">
                Thêm ví đầu tiên của bạn để bắt đầu theo dõi tài chính
              </p>
                      <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ví mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm ví mới</DialogTitle>
                <DialogDescription>
                  Thêm ví điện tử, tài khoản ngân hàng hoặc ví tiền mặt.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên ví</Label>
                  <Input
                    id="name"
                    placeholder="Ví MOMO, Vietcombank, ..."
                    value={newWallet.name}
                    onChange={(e) => setNewWallet({...newWallet, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Loại ví</Label>
                  <Select value={newWallet.type} onValueChange={(value) => setNewWallet({...newWallet, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại ví" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momo">MOMO</SelectItem>
                      <SelectItem value="zalopay">ZaloPay</SelectItem>
                      <SelectItem value="bank">Ngân hàng</SelectItem>
                      <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="crypto">Tiền điện tử</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="balance">Số dư hiện tại</Label>
                  <Input
                    id="balance"
                    type="number"
                    placeholder="0"
                    value={newWallet.balance}
                    onChange={(e) => setNewWallet({...newWallet, balance: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">Tiền tệ</Label>
                  <Select value={newWallet.currency} onValueChange={(value) => setNewWallet({...newWallet, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleAddWallet}>
                  Thêm Ví
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
              
            </CardContent>
          </Card>
        )}
      </div>
  )
}

export default Wallets
