export function applicationReceivedEmail(
  organizerName: string,
  applicantName: string,
  eventTitle: string,
  dashboardUrl: string
): { subject: string; html: string } {
  return {
    subject: `【Badminton Event Hub】${eventTitle} に新しい参加申請があります`,
    html: `
      <p>${organizerName} さん</p>
      <p>${applicantName} さんから「${eventTitle}」への参加申請がありました。</p>
      <p><a href="${dashboardUrl}">ダッシュボードで確認する</a></p>
    `,
  };
}

export function applicationApprovedEmail(
  applicantName: string,
  eventTitle: string,
  eventUrl: string
): { subject: string; html: string } {
  return {
    subject: `【Badminton Event Hub】${eventTitle} への参加が承認されました`,
    html: `
      <p>${applicantName} さん</p>
      <p>「${eventTitle}」への参加申請が承認されました。</p>
      <p><a href="${eventUrl}">イベント詳細を確認する</a></p>
    `,
  };
}

export function applicationRejectedEmail(
  applicantName: string,
  eventTitle: string
): { subject: string; html: string } {
  return {
    subject: `【Badminton Event Hub】${eventTitle} への参加申請について`,
    html: `
      <p>${applicantName} さん</p>
      <p>「${eventTitle}」への参加申請が承認されませんでした。</p>
      <p>他の練習会をお探しください。</p>
    `,
  };
}

export function newChatMessageEmail(
  receiverName: string,
  senderName: string,
  eventTitle: string,
  chatUrl: string
): { subject: string; html: string } {
  return {
    subject: `【Badminton Event Hub】${senderName} さんからメッセージがあります`,
    html: `
      <p>${receiverName} さん</p>
      <p>${senderName} さんから「${eventTitle}」に関するメッセージが届いています。</p>
      <p><a href="${chatUrl}">チャットを開く</a></p>
    `,
  };
}
