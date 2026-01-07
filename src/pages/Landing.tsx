import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { ModeToggle } from '../components/mode-toggle'
import {
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  MessageSquare,
  Sparkles,
  TrendingUp,
  PlayCircle
} from 'lucide-react'

const Landing = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bảo mật tuyệt đối",
      description: "Dữ liệu của bạn được mã hóa end-to-end với công nghệ bảo mật hàng đầu"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "AI Thông minh",
      description: "Trợ lý AI phân tích chi tiêu và đề xuất tiết kiệm thông minh"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Phân tích chuyên sâu",
      description: "Báo cáo chi tiết, biểu đồ tương tác giúp bạn hiểu rõ tài chính"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Đa nền tảng",
      description: "Truy cập mọi lúc, mọi nơi trên web và ứng dụng di động"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Chatbot hỗ trợ 24/7",
      description: "Trợ lý ảo luôn sẵn sàng giải đáp mọi thắc mắc về tài chính"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Theo dõi đầu tư",
      description: "Quản lý danh mục đầu tư và nhận cảnh báo thị trường"
    }
  ]

  const stats = [
    { value: "50K+", label: "Người dùng tin tưởng" },
    { value: "2.5T+", label: "Giao dịch được xử lý" },
    { value: "98%", label: "Độ chính xác AI" },
    { value: "24/7", label: "Hỗ trợ khách hàng" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white">D</span>
            </div>
            <span className="text-xl font-bold">FinD</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Tính năng
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Cách hoạt động
            </a>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Bảng giá
            </Link>
            <Link to="/testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Đánh giá
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Dùng thử miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Tài Chính Thông Minh
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Quản lý tài chính
            <span className="block text-primary mt-2">Thông minh hơn với AI</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl">
            FinD kết hợp trí tuệ nhân tạo để giúp bạn tiết kiệm nhiều hơn, đầu tư thông minh hơn
            và đạt được mọi mục tiêu tài chính một cách dễ dàng.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">
                <PlayCircle className="mr-2 h-5 w-5" />
                Xem demo
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Tính năng nổi bật</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mọi thứ bạn cần để làm chủ tài chính cá nhân
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Cách FinD hoạt động</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              3 bước đơn giản để làm chủ tài chính
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Kết nối tài khoản",
                description: "Kết nối an toàn với ngân hàng, ví điện tử và tài khoản đầu tư"
              },
              {
                step: "02",
                title: "AI phân tích tự động",
                description: "Trí tuệ nhân tạo phân tích chi tiêu và đề xuất tối ưu"
              },
              {
                step: "03",
                title: "Theo dõi & Tiết kiệm",
                description: "Đặt mục tiêu và theo dõi tiến độ tiết kiệm mỗi ngày"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng làm chủ tài chính?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Tham gia cùng 50,000+ người đang sử dụng FinD để quản lý tài chính thông minh hơn
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Bắt đầu miễn phí ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm opacity-75 mt-4">
              Không cần thẻ tín dụng • Dùng thử 14 ngày
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FinD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FinD. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
