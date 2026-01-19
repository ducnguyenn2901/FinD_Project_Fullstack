import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Send, Users, MessageCircle } from 'lucide-react'
import { cn } from '../components/ui/utils'
import api from '../lib/api'

type ChatMessage = {
  _id?: string
  user_id: string
  user_name?: string
  user_email?: string
  content: string
  created_at?: string
}

const CommunityChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  const fetchMessages = async () => {
    try {
      const res = await api.get<ChatMessage[]>('/chat/messages', {
        params: { limit: 100 }
      })
      setMessages(res.data || [])
    } catch (e) {
      console.error('Error fetching chat messages', e)
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const id = setInterval(fetchMessages, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setLoading(true)
    const content = input.trim()
    try {
      const res = await api.post<ChatMessage>('/chat/messages', { content })
      setMessages((prev) => [...prev, res.data])
      setInput('')
    } catch (e) {
      console.error('Error sending message', e)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const getDisplayName = (msg: ChatMessage) => {
    if (msg.user_name && msg.user_name.trim().length > 0) return msg.user_name
    if (msg.user_email && msg.user_email.includes('@')) {
      return msg.user_email.split('@')[0]
    }
    return 'Người dùng'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            Chat cộng đồng
          </h1>
          <p className="text-muted-foreground">
            Nơi trao đổi, chia sẻ kinh nghiệm quản lý tài chính với mọi người.
          </p>
        </div>
      </div>

      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Phòng chat chung
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4 pb-4" ref={scrollAreaRef}>
            {initialLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Đang tải tin nhắn...
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Chưa có tin nhắn nào. Hãy là người đầu tiên bắt đầu cuộc trò chuyện!
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m._id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getDisplayName(m).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {getDisplayName(m)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(m.created_at)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'mt-1 inline-block rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800'
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="border-t dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nhập tin nhắn của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunityChat

