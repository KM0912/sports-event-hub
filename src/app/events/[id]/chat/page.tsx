import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ChatInterface } from '@/components/chat/ChatInterface'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { id: eventId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=/events/${eventId}/chat`)
  }

  // Get event
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:host_user_id(display_name)
    `)
    .eq('id', eventId)
    .single()

  if (error || !event) {
    notFound()
  }

  const isHost = user.id === event.host_user_id
  const now = new Date()
  const chatExpired = now > new Date(event.chat_expires_at)

  // For participants: check if they have an approved application
  if (!isHost) {
    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single()

    if (!application) {
      redirect(`/events/${eventId}`)
    }

    // Get or create conversation
    let conversation
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('event_id', eventId)
      .eq('participant_user_id', user.id)
      .single()

    if (!existingConversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          event_id: eventId,
          host_user_id: event.host_user_id,
          participant_user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        redirect(`/events/${eventId}`)
      }
      conversation = newConversation
    } else {
      conversation = existingConversation
    }

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_user_id(display_name)
      `)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })

    // Check if blocked
    const { data: block } = await supabase
      .from('host_blocks')
      .select('id')
      .eq('host_user_id', event.host_user_id)
      .eq('blocked_user_id', user.id)
      .single()

    const isBlocked = !!block

    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          イベントに戻る
        </Link>

        <div className="card mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            {(event.profiles as { display_name: string })?.display_name || '主催者'}との連絡
          </h1>
          <p className="text-sm text-muted">{event.title}</p>
        </div>

        <ChatInterface
          conversationId={conversation.id}
          currentUserId={user.id}
          otherUserName={(event.profiles as { display_name: string })?.display_name || '主催者'}
          messages={messages || []}
          chatExpired={chatExpired}
          isBlocked={isBlocked}
        />
      </div>
    )
  }

  // For hosts: show list of conversations or redirect to specific participant
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(count)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  // Get participant names separately
  const participantIds = conversations?.map(c => c.participant_user_id) || []
  const { data: participants } = participantIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', participantIds)
    : { data: [] }

  const participantMap = new Map(participants?.map(p => [p.id, p.display_name]) || [])

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/events/${eventId}/applications`}
        className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        申請管理に戻る
      </Link>

      <div className="card mb-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">参加者との連絡</h1>
        <p className="text-sm text-muted">{event.title}</p>
      </div>

      {(!conversations || conversations.length === 0) ? (
        <div className="card text-center py-12">
          <p className="text-muted">まだ参加者からのメッセージはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const messageCount = (conv.messages as { count: number }[])?.[0]?.count || 0
            return (
              <Link
                key={conv.id}
                href={`/events/${eventId}/chat/${conv.participant_user_id}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {participantMap.get(conv.participant_user_id) || '参加者'}
                  </span>
                  {messageCount > 0 && (
                    <span className="text-sm text-muted">
                      {messageCount}件のメッセージ
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
