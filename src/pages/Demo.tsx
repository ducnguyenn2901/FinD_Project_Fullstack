// src/pages/Demo.tsx
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Play, Pause, SkipForward, Zap, BarChart3, Target, Shield } from 'lucide-react'

const Demo = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const demoSteps = [
    {
      title: "Kết nối tài khoản",
      description: "Kết nối an toàn với ngân hàng và ví điện tử của bạn",
      icon: <Shield className="h-8 w-8" />,
      image: "🔐"
    },
    {
      title: "AI Phân tích chi tiêu",
      description: "Trí tuệ nhân tạo phân tích và phân loại giao dịch tự động",
      icon: <Zap className="h-8 w-8" />,
      image: "📊"
    },
    {
      title: "Đặt mục tiêu tiết kiệm",
      description: "Lập kế hoạch và theo dõi tiến độ đạt mục tiêu tài chính",
      icon: <Target className="h-8 w-8" />,
      image: "🎯"
    },
    {
      title: "Theo dõi đầu tư",
      description: "Quản lý danh mục đầu tư và nhận cảnh báo thị trường",
      icon: <BarChart3 className="h-8 w-8" />,
      image: "📈"
    }
  ]


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">FinD</span>
          </div>
          <Button variant="ghost" asChild>
            <a href="/">← Quay về trang chủ</a>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Trải nghiệm FinD</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Xem cách FinD giúp bạn quản lý tài chính thông minh hơn
          </p>
        </div>

        {/* Demo Controls */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{demoSteps[currentStep].title}</h3>
                  <p className="text-muted-foreground">{demoSteps[currentStep].description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{demoSteps[currentStep].image}</div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentStep((prev) => (prev + 1) % demoSteps.length)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="flex justify-center gap-2 mt-6">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Tabs */}
        <Tabs defaultValue="dashboard" className="max-w-6xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="wallets">Ví điện tử</TabsTrigger>
            <TabsTrigger value="investments">Đầu tư</TabsTrigger>
            <TabsTrigger value="ai">AI Chatbot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-primary/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-green-500/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-4/5"></div>
                    <div className="h-8 bg-blue-500/20 rounded"></div>
                  </div>
                </div>
                <div className="h-48 bg-muted/30 rounded-lg mt-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Biểu đồ phân tích chi tiêu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallets">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {['MOMO', 'ZaloPay', 'Ngân hàng'].map((wallet, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {idx === 0 ? '👛' : idx === 1 ? '📱' : '🏦'}
                        </div>
                        <div>
                          <p className="font-medium">{wallet}</p>
                          <p className="text-sm text-muted-foreground">Số dư: {['5.2M ₫', '3.8M ₫', '25.5M ₫'][idx]}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Chi tiết</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="investments">
            <Card>
              <CardContent className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Mã</th>
                        <th className="text-left p-3">Giá trị</th>
                        <th className="text-left p-3">Thay đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { symbol: 'VNM', value: '15.2M ₫', change: '+2.5%' },
                        { symbol: 'VIC', value: '8.7M ₫', change: '-1.2%' },
                        { symbol: 'BTC', value: '12.5M ₫', change: '+5.8%' },
                        { symbol: 'ETH', value: '6.3M ₫', change: '+3.1%' }
                      ].map((stock, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-3 font-medium">{stock.symbol}</td>
                          <td className="p-3">{stock.value}</td>
                          <td className={`p-3 ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span>🤖</span>
                    </div>
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p>Xin chào! Tôi có thể giúp gì cho tài chính của bạn hôm nay?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                      <p>Phân tích chi tiêu của tôi tháng này</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span>👤</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span>🤖</span>
                    </div>
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p>Tháng này bạn đã chi 8.5M ₫ cho ăn uống. Tôi đề xuất giảm 20% để tiết kiệm thêm 1.7M ₫.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Đã sẵn sàng dùng thực tế?</h2>
          <p className="text-muted-foreground mb-8">
            Đăng ký miễn phí và trải nghiệm tất cả tính năng
          </p>
          <Button size="lg" asChild>
            <a href="/auth?mode=signup">Bắt đầu ngay</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Demo
