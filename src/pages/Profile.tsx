import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Globe,
  Camera,
  Save,
  Edit,
  CreditCard,
  History,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { toast } from 'sonner'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    dob: '',
    language: 'vi',
    currency: 'VND',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      showBalance: true,
      showTransactions: false,
      twoFactorAuth: false
    }
  })

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    setPasswordError('')
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      setIsChangingPassword(true)
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      toast.success('Đổi mật khẩu thành công')
      setIsChangePasswordOpen(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Đổi mật khẩu thất bại'
      setPasswordError(msg)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin và cài đặt tài khoản</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setProfileData(prev => ({
                    ...prev,
                    name: user?.name ?? prev.name,
                    email: user?.email ?? prev.email
                  }))
                  setIsEditing(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Quản lý thông tin cá nhân và liên hệ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={''} />
                      <AvatarFallback className="text-lg">
                        {getInitials(profileData.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                        variant="outline"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    {isEditing ? (
                      <div className="grid gap-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-2xl font-bold">{user?.name || profileData.name || 'Người dùng'}</h3>
                        <p className="text-muted-foreground">{user?.email || profileData.email}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Người dùng
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Tham gia: {formatJoinDate(user?.createdAt || new Date().toISOString())}
              </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    ) : (
                      <p>{user?.email || profileData.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    ) : (
                      <p>{profileData.phone || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày sinh
                    </Label>
                    {isEditing ? (
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                      />
                    ) : (
                      <p>{profileData.dob || 'Chưa cập nhật'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    ) : (
                      <p>{profileData.address || 'Chưa cập nhật'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu bản thân</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Giới thiệu về bản thân..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {profileData.bio || 'Chưa có giới thiệu...'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Settings Tabs */}
            <Tabs defaultValue="notifications">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Thông báo
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Bảo mật
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Tùy chọn
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email thông báo</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo qua email về giao dịch và cập nhật
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={profileData.notifications.email}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            notifications: {...profileData.notifications, email: checked}
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                        <p className="text-sm text-muted-foreground">
                          Hiển thị thông báo trên trình duyệt
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={profileData.notifications.push}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            notifications: {...profileData.notifications, push: checked}
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo qua tin nhắn SMS
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={profileData.notifications.sms}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            notifications: {...profileData.notifications, sms: checked}
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-notifications">Tin tiếp thị</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông tin về sản phẩm và ưu đãi mới
                        </p>
                      </div>
                      <Switch
                        id="marketing-notifications"
                        checked={profileData.notifications.marketing}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            notifications: {...profileData.notifications, marketing: checked}
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-balance">Hiển thị số dư</Label>
                        <p className="text-sm text-muted-foreground">
                          Cho phép hiển thị số dư tài khoản trên dashboard
                        </p>
                      </div>
                      <Switch
                        id="show-balance"
                        checked={profileData.privacy.showBalance}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            privacy: {...profileData.privacy, showBalance: checked}
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-transactions">Hiển thị giao dịch</Label>
                        <p className="text-sm text-muted-foreground">
                          Cho phép xem chi tiết giao dịch từ người khác
                        </p>
                      </div>
                      <Switch
                        id="show-transactions"
                        checked={profileData.privacy.showTransactions}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            privacy: {...profileData.privacy, showTransactions: checked}
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor">Xác thực 2 yếu tố</Label>
                        <p className="text-sm text-muted-foreground">
                          Thêm lớp bảo mật cho tài khoản của bạn
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={profileData.privacy.twoFactorAuth}
                        onCheckedChange={(checked) => 
                          setProfileData({
                            ...profileData,
                            privacy: {...profileData.privacy, twoFactorAuth: checked}
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Ngôn ngữ
                      </Label>
                      <select
                        id="language"
                        className="w-full p-2 border rounded-md"
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Đơn vị tiền tệ
                      </Label>
                      <select
                        id="currency"
                        className="w-full p-2 border rounded-md"
                        value={profileData.currency}
                        onChange={(e) => setProfileData({...profileData, currency: e.target.value})}
                      >
                        <option value="VND">VND (₫)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tổng tài sản</span>
                    <span className="font-semibold">45.2M ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Số ví</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Giao dịch tháng này</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Đăng ký dịch vụ</span>
                    <span className="font-semibold">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <History className="mr-2 h-4 w-4" />
                  Xem lịch sử hoạt động
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordOpen(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Xác minh email
                </Button>
              </CardContent>
            </Card>

            {/* Account Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Xác minh tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Đã xác minh</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Số điện thoại</p>
                    <p className="text-sm text-muted-foreground">Chưa xác minh</p>
                  </div>
                  <Badge variant="outline">Xác minh</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Danh tính</p>
                    <p className="text-sm text-muted-foreground">Chưa xác minh</p>
                  </div>
                  <Badge variant="outline">Xác minh</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {passwordError && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Hủy</Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
  )
}

export default Profile
