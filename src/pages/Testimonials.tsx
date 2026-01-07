// src/pages/Testimonials.tsx
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: "Nguyễn Minh Đức",
      role: "Freelancer",
      content: "FinD giúp tôi tiết kiệm được 5 triệu mỗi tháng. AI phân tích chi tiêu rất chính xác!",
      rating: 5,
      avatar: "MA"
    },
    {
      name: "Đoàn Thị Như",
      role: "Doanh nhân",
      content: "Quản lý đầu tư trở nên dễ dàng hơn bao giờ hết. Cảnh báo thị trường rất hữu ích.",
      rating: 5,
      avatar: "TB"
    },
    {
      name: "Nguyễn Thu Thảo",
      role: "Giáo viên",
      content: "Giao diện dễ sử dụng, giúp tôi lập kế hoạch tài chính gia đình hiệu quả.",
      rating: 4,
      avatar: "LH"
    },
    {
      name: "Trần Thu Hường",
      role: "Sinh viên",
      content: "Từ khi dùng FinD, tôi kiểm soát được chi tiêu và đã tiết kiệm được 20 triệu.",
      rating: 5,
      avatar: "PD"
    },
    {
      name: "Huỳnh Quốc Đạt",
      role: "Kế toán",
      content: "Công cụ phân tích mạnh mẽ, báo cáo chi tiết giúp tôi đưa ra quyết định đúng đắn.",
      rating: 5,
      avatar: "HT"
    },
    {
      name: "Duc Nguyen",
      role: "Developer",
      content: "API dễ tích hợp, chatbot hỗ trợ nhanh chóng. Sản phẩm tuyệt vời!",
      rating: 4,
      avatar: "VC"
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
          <h1 className="text-4xl md:text-5xl font-bold">Người dùng nói gì về FinD</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hơn 50,000+ người đã tin tưởng sử dụng FinD để quản lý tài chính
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-6 w-6 text-primary/20" />
                  <p className="text-muted-foreground italic pl-4">"{testimonial.content}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y">
          {[
            { value: "98%", label: "Hài lòng với sản phẩm" },
            { value: "4.8/5", label: "Đánh giá trung bình" },
            { value: "50K+", label: "Người dùng tích cực" },
            { value: "24/7", label: "Hỗ trợ khách hàng" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Sẵn sàng trải nghiệm?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người đang quản lý tài chính thông minh hơn mỗi ngày
          </p>
          <Button size="lg" asChild>
            <a href="/auth?mode=signup">Bắt đầu miễn phí ngay</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Testimonials
