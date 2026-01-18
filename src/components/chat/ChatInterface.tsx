'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendChatMessage, markConversationAsRead } from '@/actions/chat'
import { QUICK_MESSAGES } from '@/lib/constants'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Send, Clock, Ban, Zap } from 'lucide-react'
import clsx from 'clsx'

type Message = {
  id: string
  sender_user_id: string
  body: string
  created_at: string
  profiles: { display_name: string } | null
}

type ChatInterfaceProps = {
  conversationId: string
  currentUserId: string
  otherUserName: string
  messages: Message[]
  chatExpired: boolean
  isBlocked: boolean
}

export function ChatInterface({
  conversationId,
  currentUserId,
  otherUserName,
  messages: initialMessages,
  chatExpired,
  isBlocked,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [showQuickMessages, setShowQuickMessages] = useState(false)
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // チャット画面を開いた時に自動で既読にする
  useEffect(() => {
    markConversationAsRead(conversationId)
  }, [conversationId])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Get the sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.sender_user_id)
            .single()

          const newMsg: Message = {
            id: payload.new.id,
            sender_user_id: payload.new.sender_user_id,
            body: payload.new.body,
            created_at: payload.new.created_at,
            profiles: profile,
          }

          setMessages((prev) => [...prev, newMsg])

          // 相手からのメッセージを受信した場合、既読にする
          if (payload.new.sender_user_id !== currentUserId) {
            markConversationAsRead(conversationId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim() || chatExpired || isBlocked) return

    startTransition(async () => {
      const result = await sendChatMessage(conversationId, messageText.trim())
      if (result.error) {
        console.error('Error sending message:', result.error)
      }
      setNewMessage('')
      setShowQuickMessages(false)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(newMessage)
  }

  const handleQuickMessage = (message: string) => {
    handleSendMessage(message)
  }

  const canSend = !chatExpired && !isBlocked

  return (
    <div className="card flex flex-col h-[600px]">
      {/* Status Bar */}
      {(chatExpired || isBlocked) && (
        <div
          className={clsx(
            'flex items-center gap-2 px-4 py-2 -mx-6 -mt-6 mb-4 rounded-t-xl',
            chatExpired ? 'bg-muted-bg text-muted' : 'bg-error/10 text-error'
          )}
        >
          {chatExpired ? (
            <>
              <Clock className="w-4 h-4" />
              <span className="text-sm">チャット期限が終了しました（閲覧のみ）</span>
            </>
          ) : (
            <>
              <Ban className="w-4 h-4" />
              <span className="text-sm">メッセージを送信できません</span>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted py-12">
            <p>メッセージはまだありません</p>
            <p className="text-sm mt-1">
              緊急の連絡や当日のやりとりにご利用ください
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_user_id === currentUserId
            return (
              <div
                key={message.id}
                className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-4 py-2',
                    isOwn
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-muted-bg text-gray-900 rounded-bl-sm'
                  )}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {message.profiles?.display_name || otherUserName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p
                    className={clsx(
                      'text-xs mt-1',
                      isOwn ? 'text-white/70' : 'text-muted'
                    )}
                  >
                    {format(new Date(message.created_at), 'HH:mm', { locale: ja })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Messages */}
      {canSend && showQuickMessages && (
        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
          {QUICK_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => handleQuickMessage(msg)}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-muted-bg rounded-full hover:bg-gray-200 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      {canSend && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowQuickMessages(!showQuickMessages)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showQuickMessages
                ? 'bg-primary text-white'
                : 'bg-muted-bg text-muted hover:bg-gray-200'
            )}
            title="定型文"
          >
            <Zap className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            maxLength={500}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isPending}
            className="btn btn-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {canSend && (
        <p className="text-xs text-muted text-center mt-2">
          {newMessage.length}/500文字
        </p>
      )}
    </div>
  )
}
