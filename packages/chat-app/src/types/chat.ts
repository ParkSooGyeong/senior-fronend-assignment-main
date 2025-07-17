export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export enum MessageStatus {
  Sending = 'sending',
  Sent = 'sent',
  Error = 'error',
  Editing = 'editing'
}

export type ContentType = 'text' | 'markdown' | 'html' | 'json';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  contentType: ContentType;
  timestamp: number;
  status: MessageStatus;
  error?: string;
  isEditable?: boolean;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  retryCount: number;
  isOffline: boolean;
}

export interface StreamChunk {
  id: string;
  choices: {
    delta: {
      content?: string;
      role?: MessageRole;
    };
    finish_reason: string | null;
  }[];
} 