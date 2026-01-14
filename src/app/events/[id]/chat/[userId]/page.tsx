import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ChatInterface } from '@/components/chat/ChatInterface'

type PageProps = {
  params: Promise<{ id: string; userId: string }>
}

export default async function HostChatPage({ params }: PageProps) {
  const { id: eventId, userId: participantId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=/events/${eventId}/chat/${participantId}`)
  }

  // Get event and verify host
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('host_user_id', user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get participant profile
  const { data: participant } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', participantId)
    .single()

  if (!participant) {
    notFound()
  }

  const now = new Date()
  const chatExpired = now > new Date(event.chat_expires_at)

  // Get or create conversation
  let conversation
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('event_id', eventId)
    .eq('participant_user_id', participantId)
    .single()

  if (!existingConversation) {
    // Check if participant has approved application
    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', participantId)
      .eq('status', 'approved')
      .single()

    if (!application) {
      redirect(`/events/${eventId}/applications`)
    }

    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        event_id: eventId,
        host_user_id: user.id,
        participant_user_id: participantId,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating conversation:', createError)
      redirect(`/events/${eventId}/applications`)
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

  // Check if participant is blocked
  const { data: block } = await supabase
    .from('host_blocks')
    .select('id')
    .eq('host_user_id', user.id)
    .eq('blocked_user_id', participantId)
    .single()

  const isBlocked = !!block

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/events/${eventId}/chat`}
        className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        戻る
      </Link>

      <div className="card mb-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">
          {participant.display_name}との連絡
        </h1>
        <p className="text-sm text-muted">{event.title}</p>
      </div>

      <ChatInterface
        conversationId={conversation.id}
        currentUserId={user.id}
        otherUserName={participant.display_name}
        messages={messages || []}
        chatExpired={chatExpired}
        isBlocked={isBlocked}
      />
    </div>
  )
}
