import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Separator } from '../components/ui/separator'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { signUp, signOut } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (!acceptTerms) {
      setError('Vui lòng chấp nhận điều khoản sử dụng')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, name)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      await signOut()
      navigate('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return { score: 0, text: 'Chưa nhập' }
    if (password.length < 6) return { score: 1, text: 'Rất yếu' }
    if (password.length < 8) return { score: 2, text: 'Yếu' }
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { score: 4, text: 'Mạnh' }
    }
    return { score: 3, text: 'Trung bình' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white">D</span>
            </div>
            <span className="text-xl font-bold">FinD</span>
          </div>
          <p className="text-muted-foreground">Tạo tài khoản mới</p>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>
              Tạo tài khoản để bắt đầu quản lý tài chính thông minh
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Độ mạnh mật khẩu:</span>
                      <span className={`font-medium ${
                        strength.score >= 4 ? 'text-green-600' :
                        strength.score >= 3 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {strength.text}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          strength.score >= 4 ? 'w-full bg-green-500' :
                          strength.score >= 3 ? 'w-3/4 bg-yellow-500' :
                          strength.score >= 2 ? 'w-1/2 bg-orange-500' :
                          'w-1/4 bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password requirements */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                      password.length >= 8 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {password.length >= 8 && <Check className="h-3 w-3" />}
                    </div>
                    <span className={password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                      Ít nhất 8 ký tự
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                      /[A-Z]/.test(password) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {/[A-Z]/.test(password) && <Check className="h-3 w-3" />}
                    </div>
                    <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                      Có chữ in hoa
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                      /[0-9]/.test(password) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {/[0-9]/.test(password) && <Check className="h-3 w-3" />}
                    </div>
                    <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                      Có số
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">Mật khẩu không khớp</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm leading-tight">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !acceptTerms}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </Button>

              <Separator />

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Đã có tài khoản? </span>
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Đăng nhập ngay
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-medium text-center">Khi đăng ký FinD, bạn được:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">AI phân tích miễn phí</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">14 ngày dùng thử Pro</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Lock className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm">Bảo mật dữ liệu</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Mail className="h-3 w-3 text-purple-600" />
              </div>
              <span className="text-sm">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
