import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  applicationReceivedEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
  newChatMessageEmail,
} from '../_shared/email-templates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'http://127.0.0.1:3000';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@example.com';

interface NotificationPayload {
  type:
    | 'application_received'
    | 'application_approved'
    | 'application_rejected'
    | 'new_chat_message';
  data: Record<string, string>;
}

Deno.serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json();
    const { type, data } = payload;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let email: { subject: string; html: string } | null = null;
    let toEmail: string | null = null;

    switch (type) {
      case 'application_received': {
        const { data: organizer } = await supabase.auth.admin.getUserById(
          data.organizerId
        );
        if (!organizer.user?.email) break;
        toEmail = organizer.user.email;
        email = applicationReceivedEmail(
          data.organizerName,
          data.applicantName,
          data.eventTitle,
          `${APP_URL}/dashboard/events/${data.eventId}/applications`
        );
        break;
      }
      case 'application_approved': {
        const { data: applicant } = await supabase.auth.admin.getUserById(
          data.applicantId
        );
        if (!applicant.user?.email) break;
        toEmail = applicant.user.email;
        email = applicationApprovedEmail(
          data.applicantName,
          data.eventTitle,
          `${APP_URL}/events/${data.eventId}`
        );
        break;
      }
      case 'application_rejected': {
        const { data: applicant } = await supabase.auth.admin.getUserById(
          data.applicantId
        );
        if (!applicant.user?.email) break;
        toEmail = applicant.user.email;
        email = applicationRejectedEmail(data.applicantName, data.eventTitle);
        break;
      }
      case 'new_chat_message': {
        const { data: receiver } = await supabase.auth.admin.getUserById(
          data.receiverId
        );
        if (!receiver.user?.email) break;
        toEmail = receiver.user.email;
        email = newChatMessageEmail(
          data.receiverName,
          data.senderName,
          data.eventTitle,
          `${APP_URL}/chat/${data.eventId}/${data.senderId}`
        );
        break;
      }
    }

    if (!email || !toEmail) {
      return new Response(JSON.stringify({ sent: false, reason: 'no_email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resend APIでメール送信（APIキーがない場合はスキップ）
    if (!RESEND_API_KEY) {
      console.log(`[DEV] Would send email to ${toEmail}: ${email.subject}`);
      return new Response(
        JSON.stringify({ sent: false, reason: 'no_api_key' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject: email.subject,
        html: email.html,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify({ sent: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
