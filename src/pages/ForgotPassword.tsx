import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Key } from 'lucide-react'
import api from '../lib/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setResetLink('')
    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSuccess(true)
      if (res.data.resetLink) {
        setResetLink(res.data.resetLink)
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || (err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold">FinD</span>
          </div>
          <p className="text-muted-foreground">Khôi phục quyền truy cập tài khoản</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {success ? 'Kiểm tra email của bạn' : 'Quên mật khẩu?'}
            </CardTitle>
            <CardDescription className="text-center">
              {success 
                ? 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.'
                : 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Đã gửi liên kết!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nếu có tài khoản đăng ký với <strong>{email}</strong>, bạn sẽ nhận được email hướng dẫn.
                  </p>
                  
                  {resetLink && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mb-4">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">
                        Demo Only (Email Service Not Configured)
                      </p>
                      <p className="text-sm break-all font-mono text-blue-600 dark:text-blue-400">
                        <a href={resetLink} className="underline hover:text-blue-800">
                          {resetLink}
                        </a>
                      </p>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                      setResetLink('')
                    }}
                  >
                    Thử lại với email khác
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email đăng ký</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Gửi liên kết đặt lại'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter>
            <div className="w-full text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardFooter>
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
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Bảo mật cao</p>
          </div>
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Dễ dàng khôi phục</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
