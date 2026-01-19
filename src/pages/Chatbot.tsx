import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { ScrollArea } from '../components/ui/scroll-area'
import { Bot, User, Send, Sparkles, X, Minimize2 } from 'lucide-react'
import { cn } from '../components/ui/utils'
import api from '../lib/api'

const INITIAL_NOW = Date.now()

interface Message {
  id: number
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem('chatbot_messages')
      if (raw) {
        const parsed: Array<{ id: number; content: string; sender: 'user' | 'ai'; timestamp: string }> = JSON.parse(raw)
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      }
    } catch {}
    return [
      { 
        id: 1, 
        content: "Xin chào! Tôi là trợ lý tài chính AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?", 
        sender: 'ai', 
        timestamp: new Date(INITIAL_NOW - 3600000) 
      }
    ]
  })
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickQuestions = [
    "Phân tích chi tiêu của tôi",
    "Đề xuất tiết kiệm",
    "Tư vấn đầu tư",
    "Trợ giúp lập ngân sách",
    "Kiểm tra đăng ký trùng lặp"
  ]

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    try {
      const serializable = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }))
      localStorage.setItem('chatbot_messages', JSON.stringify(serializable))
    } catch {}
  }, [messages])

  const buildContextMessages = (latestUserPrompt: string) => {
    const recent = messages.slice(-8) // include last 8 for context
    const mapped = recent.map(m => ({
      role: m.sender === 'ai' ? 'assistant' as const : 'user' as const,
      content: m.content
    }))
    return [
      { role: 'system', content: 'Bạn là trợ lý tài chính cá nhân thân thiện, trả lời ngắn gọn, hữu ích.' },
      ...mapped,
      { role: 'user', content: latestUserPrompt }
    ]
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

    const getAIResponse = async (prompt: string) => {
      try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
        const model = import.meta.env.VITE_OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
        if (!apiKey) {
          const fallbacks = [
            "Dựa trên mẫu chi tiêu, hãy thử dành 20% thu nhập cho tiết kiệm.",
            "Bạn có thể tối ưu đăng ký bằng cách gộp gói gia đình hoặc hủy dịch vụ ít dùng.",
            "Danh mục đầu tư nên đa dạng hóa theo mục tiêu và mức rủi ro.",
            "Thiết lập ngân sách 50/30/20 để cân bằng chi tiêu và tiết kiệm.",
            "Tự động chuyển tiền tiết kiệm mỗi tháng giúp đạt mục tiêu nhanh hơn."
          ]
          return fallbacks[Math.floor(Math.random() * fallbacks.length)]
        }

        const res = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages: buildContextMessages(prompt)
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'FinD Assistant'
            }
          }
        )

        const text = res.data?.choices?.[0]?.message?.content?.trim()
        return text || 'Xin lỗi, tôi chưa thể trả lời ngay. Vui lòng thử lại sau.'
      } catch (error) {
        console.error('AI API error:', error)
        return 'Hệ thống AI đang bận. Tôi sẽ phản hồi sớm nhất có thể.'
      }
    }

    ;(async () => {
      const reply = await getAIResponse(newMessage.content)
      const aiMessage: Message = {
        id: newMessage.id + 1,
        content: reply,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    })()
  }

  // Deprecated: replaced by handleQuickAction

  const analyzeSpending = async () => {
    try {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 30)
      const s = start.toISOString().slice(0, 10)
      const e = end.toISOString().slice(0, 10)
      const res = await api.get('/transactions', { params: { start: s, end: e } })
      const rows: Array<{ amount: number; type: 'income' | 'expense'; category?: string }> = res.data || []
      let income = 0
      let expense = 0
      const byCat: Record<string, number> = {}
      rows.forEach(r => {
        if (r.type === 'income') income += r.amount
        else expense += Math.abs(r.amount)
        const cat = (r.category || 'Khác').trim()
        byCat[cat] = (byCat[cat] || 0) + Math.abs(r.amount)
      })
      const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3)
      const msg = [
        `Tổng thu 30 ngày: ${income.toLocaleString('vi-VN')}₫`,
        `Tổng chi 30 ngày: ${expense.toLocaleString('vi-VN')}₫`,
        `Top hạng mục chi: ${topCats.map(([c, v]) => `${c} (${v.toLocaleString('vi-VN')}₫)`).join(', ') || 'Không có dữ liệu'}`,
        `Khuyến nghị: xem xét giảm 5–10% ở hạng mục đứng đầu để tăng tiết kiệm.`
      ].join('\n')
      setMessages(prev => [...prev, { id: prev.length + 1, content: msg, sender: 'ai', timestamp: new Date() }])
    } catch (error) {
      setMessages(prev => [...prev, { id: prev.length + 1, content: 'Không lấy được dữ liệu chi tiêu.', sender: 'ai', timestamp: new Date() }])
    }
  }

  const analyzeSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions')
      const subs: Array<{ name: string; amount: number; status?: string }> = res.data || []
      const groups: Record<string, Array<{ amount: number }>> = {}
      subs.forEach(s => {
        const key = s.name.trim().toLowerCase()
        if (!groups[key]) groups[key] = []
        groups[key].push({ amount: s.amount })
      })
      const duplicates = Object.entries(groups).filter(([, arr]) => arr.length > 1)
      const total = subs.reduce((sum, s) => sum + (s.amount || 0), 0)
      const msg = duplicates.length > 0
        ? `Phát hiện đăng ký trùng: ${duplicates.map(([k, arr]) => `${k} x${arr.length}`).join(', ')}.\nTổng chi đăng ký: ${total.toLocaleString('vi-VN')}₫/tháng. Khuyến nghị: cân nhắc gộp/hủy dịch vụ ít dùng.`
        : `Không thấy đăng ký trùng lặp. Tổng chi đăng ký: ${total.toLocaleString('vi-VN')}₫/tháng.`
      setMessages(prev => [...prev, { id: prev.length + 1, content: msg, sender: 'ai', timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: prev.length + 1, content: 'Không lấy được dữ liệu đăng ký.', sender: 'ai', timestamp: new Date() }])
    }
  }

  const analyzeInvestments = async () => {
    try {
      const res = await api.get('/investments')
      const invs: Array<{ type: string; quantity: number; avg_price: number; current_price?: number | null }> = res.data || []
      const totalUSD = invs.reduce((sum, i) => sum + i.quantity * (i.current_price ?? i.avg_price), 0)
      const alloc: Record<string, number> = {}
      invs.forEach(i => {
        const val = i.quantity * (i.current_price ?? i.avg_price)
        const t = i.type || 'other'
        alloc[t] = (alloc[t] || 0) + val
      })
      const parts = Object.entries(alloc).map(([t, v]) => `${t}: ${(v / (totalUSD || 1) * 100).toFixed(1)}%`)
      const msg = [
        `Tổng giá trị (USD): ${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        `Phân bổ: ${parts.join(', ')}`,
        `Gợi ý: đa dạng hóa nếu một loại vượt quá 60% tổng danh mục; xem xét thêm ETF chỉ số nếu tỷ trọng cổ phiếu thấp.`
      ].join('\n')
      setMessages(prev => [...prev, { id: prev.length + 1, content: msg, sender: 'ai', timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: prev.length + 1, content: 'Không lấy được dữ liệu đầu tư.', sender: 'ai', timestamp: new Date() }])
    }
  }

  const handleQuickAction = async (q: string) => {
    setIsTyping(true)
    if (q.includes('chi tiêu')) {
      await analyzeSpending()
    } else if (q.includes('đăng ký')) {
      await analyzeSubscriptions()
    } else if (q.includes('đầu tư')) {
      await analyzeInvestments()
    } else if (q.includes('ngân sách')) {
      const msg = 'Khuyến nghị ngân sách 50/30/20: 50% nhu cầu, 30% mong muốn, 20% tiết kiệm. Điều chỉnh theo mục tiêu cá nhân.'
      setMessages(prev => [...prev, { id: prev.length + 1, content: msg, sender: 'ai', timestamp: new Date() }])
    } else {
      setMessages(prev => [...prev, { id: prev.length + 1, content: 'Bạn muốn tôi hỗ trợ phần nào cụ thể?', sender: 'ai', timestamp: new Date() }])
    }
    setIsTyping(false)
  }

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        content: "Xin chào! Tôi là trợ lý tài chính AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?", 
        sender: 'ai', 
        timestamp: new Date()
      }
    ])
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
                  onClick={() => handleQuickAction(question)}
                >
                  {question}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={clearChat}
              >
                Xóa hội thoại
              </Button>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
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
