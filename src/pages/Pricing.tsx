// src/pages/Pricing.tsx
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Check } from 'lucide-react'

const Pricing = () => {
  const plans = [
    {
      name: "Miễn phí",
      price: "0₫",
      period: "/tháng",
      features: [
        "Theo dõi 3 ví điện tử",
        "5 giao dịch/tháng",
        "Phân tích cơ bản",
        "Hỗ trợ email",
        "1 mục tiêu tiết kiệm"
      ],
      cta: "Bắt đầu miễn phí",
      popular: false
    },
    {
      name: "Pro",
      price: "99.000₫",
      period: "/tháng",
      features: [
        "Theo dõi không giới hạn ví",
        "Giao dịch không giới hạn",
        "Phân tích AI nâng cao",
        "Hỗ trợ ưu tiên",
        "10 mục tiêu tiết kiệm",
        "Theo dõi đầu tư",
        "Xuất báo cáo"
      ],
      cta: "Dùng thử 14 ngày",
      popular: true
    },
    {
      name: "Doanh nghiệp",
      price: "Liên hệ",
      period: "",
      features: [
        "Tất cả tính năng Pro",
        "Quản lý nhiều người dùng",
        "API tích hợp",
        "Hỗ trợ 24/7",
        "Tuỳ chỉnh báo cáo",
        "On-premise deployment",
        "Đào tạo team"
      ],
      cta: "Liên hệ tư vấn",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Bảng giá linh hoạt</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu quản lý tài chính của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Phổ biến nhất
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href={plan.name === "Doanh nghiệp" ? "mailto:sales@finsmart.com" : "/auth?mode=signup"}>
                    {plan.cta}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>
          <div className="space-y-6">
            {[
              {
                q: "Tôi có thể đổi gói bất cứ lúc nào không?",
                a: "Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Thay đổi có hiệu lực ngay lập tức."
              },
              {
                q: "Có phí ẩn nào không?",
                a: "Không, tất cả phí đều được công bố rõ ràng. Không có phí thiết lập hay phí ẩn."
              },
              {
                q: "Tôi có thể hủy gói Pro bất cứ lúc nào không?",
                a: "Có, bạn có thể hủy bất cứ lúc nào. Sau khi hủy, bạn vẫn có thể sử dụng đến hết kỳ thanh toán."
              }
            ].map((item, idx) => (
              <div key={idx} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
