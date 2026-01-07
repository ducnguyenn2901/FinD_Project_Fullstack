import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { Bot, User, Send, Sparkles, X, Minimize2 } from 'lucide-react'
import { cn } from '../ui/utils'

interface Message {
  id: number
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      content: "Xin chào! Tôi là trợ lý tài chính AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?", 
      sender: 'ai', 
      timestamp: new Date(Date.now() - 3600000) 
    },
    { 
      id: 2, 
      content: "Bạn có thể phân tích thói quen chi tiêu của tôi không?", 
      sender: 'user', 
      timestamp: new Date(Date.now() - 1800000) 
    },
    { 
      id: 3, 
      content: "Tất nhiên! Dựa trên các giao dịch gần đây, tôi nhận thấy bạn đang chi khoảng 3 triệu đồng mỗi tháng cho ăn uống bên ngoài. Bạn có muốn các đề xuất để tối ưu hóa khoản này không?", 
      sender: 'ai', 
      timestamp: new Date(Date.now() - 900000) 
    },
  ])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickQuestions = [
    "Phân tích chi tiêu của tôi",
    "Đề xuất tiết kiệm",
    "Tư vấn đầu tư",
    "Trợ giúp lập ngân sách",
    "Kiểm tra đăng ký trùng lặp"
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Dựa trên mẫu chi tiêu của bạn, tôi đề xuất nên để dành 20% thu nhập cho tiết kiệm.",
        "Tôi nhận thấy bạn có nhiều đăng ký dịch vụ. Bạn có muốn tôi xác định những dịch vụ nào có thể hủy không?",
        "Danh mục đầu tư của bạn có thể hưởng lợi từ việc đa dạng hóa hơn. Hãy cân nhắc thêm một số quỹ chỉ số.",
        "Câu hỏi hay! Để tôi phân tích các giao dịch gần đây của bạn và đưa ra đề xuất cá nhân hóa.",
        "Tôi thấy bạn có thể tiết kiệm thêm 500.000₫ mỗi tháng bằng cách tối ưu hóa chi phí đăng ký.",
        "Dựa trên mục tiêu tiết kiệm của bạn, tôi đề xuất tự động chuyển 10% thu nhập vào tài khoản tiết kiệm mỗi tháng."
      ]
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <Bot className="h-5 w-5 mr-2" />
          Chat với AI
          <Sparkles className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96">
      <Card className="shadow-xl border-2 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Trợ lý Tài chính AI</CardTitle>
                <p className="text-xs text-muted-foreground">Hỗ trợ 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Quick Questions */}
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Câu hỏi nhanh:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-80 px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    {message.sender === 'ai' ? (
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2",
                    message.sender === 'ai'
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-blue-600 text-white'
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.sender === 'ai' ? 'text-gray-500 dark:text-gray-400' : 'text-blue-200'
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI có thể mắc sai sót. Hãy kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Chatbot
