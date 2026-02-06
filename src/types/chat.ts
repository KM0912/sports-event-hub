export interface ChatMessage {
  id: string;
  eventId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string;
    displayName: string;
  };
}
