// src/pages/ResetPassword.tsx - SAME STYLE AS LOGIN
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { Eye, EyeOff, Lock, CheckCircle2, Key, AlertCircle, Sparkles } from 'lucide-react'
import api from '../lib/api'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const checkSession = React.useCallback(async () => {
    const email = searchParams.get('email')
    if (email) {
      setIsValidToken(true)
      setError('')
    } else {
      setIsValidToken(false)
      setError('Không tìm thấy liên kết đặt lại mật khẩu hợp lệ.')
    }
  }, [searchParams])

  useEffect(() => {
    checkSession()
  }, [checkSession])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Updating password...')
      const email = searchParams.get('email') || ''
      await api.post('/auth/reset-password', { email, password })

      console.log('✅ Password updated successfully')
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (err: unknown) {
      console.error('❌ Password reset error:', err)
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || (err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const useDevMode = async () => {
    if (import.meta.env.DEV) {
      console.log('🔄 Dev mode: Bypassing token check')
      
      localStorage.setItem('dev_auth', JSON.stringify({
        user: { id: 'dev-user', email: 'dev@example.com' },
        session: { access_token: 'dev-token' }
      }))
      
      setIsValidToken(true)
      setError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Key className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">FinD</span>
          </div>
          <p className="text-muted-foreground">Đặt lại mật khẩu tài khoản của bạn</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {success ? 'Mật khẩu đã được đặt lại!' : 'Đặt lại mật khẩu'}
            </CardTitle>
            <CardDescription className="text-center">
              {success 
                ? 'Mật khẩu của bạn đã được thay đổi thành công'
                : 'Nhập mật khẩu mới cho tài khoản của bạn'
              }
            </CardDescription>
          </CardHeader>
          
          {isValidToken === null ? (
            <CardContent className="py-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang kiểm tra liên kết...</p>
              </div>
            </CardContent>
          ) : isValidToken === false ? (
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Liên kết không hợp lệ</h3>
                <p className="text-muted-foreground mb-4">
                  Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Yêu cầu liên kết mới
                  </Button>
                </Link>
              </div>
              
              {import.meta.env.DEV && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={useDevMode}
                >
                  Dev Mode: Bypass Check
                </Button>
              )}
            </CardContent>
          ) : success ? (
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thành công!</h3>
                <p className="text-muted-foreground mb-4">
                  Mật khẩu của bạn đã được thay đổi thành công. 
                  Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {import.meta.env.DEV && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>💡 Development Mode:</strong> Bạn đang truy cập trực tiếp mà không có token.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
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
                      minLength={6}
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
                  <p className="text-xs text-muted-foreground">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>

                <Separator />

                <div className="text-center text-sm">
                  <Link 
                    to="/login" 
                    className="text-primary font-medium hover:underline"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">AI Thông minh</p>
          </div>
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Bảo mật cao</p>
          </div>
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Đặt lại mật khẩu</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
