import OpenAI from 'openai';
import { Message, MessageRole, MessageStatus } from '../types/chat';
import { detectContentType } from '../utils/contentTypeDetector';

// Use local mock server instead of real OpenAI API
const MOCK_SERVER_URL = 'http://localhost:8080/v1';

const openai = new OpenAI({
  apiKey: 'mock-api-key', // Mock server doesn't validate this
  baseURL: MOCK_SERVER_URL,
  dangerouslyAllowBrowser: true
});

export interface ChatServiceOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export class ChatService {
  private static instance: ChatService;
  private model = 'gpt-3.5-turbo';
  private maxTokens = 1000;
  private temperature = 0.7;

  private constructor() {
    console.log('🎭 ChatService initialized with Mock Server');
    console.log('📡 Mock Server URL:', MOCK_SERVER_URL);
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(
    messages: Message[],
    options: ChatServiceOptions = {}
  ): Promise<Message> {
    const { model = this.model, maxTokens = this.maxTokens, temperature = this.temperature } = options;

    try {
      console.log('📤 Sending message to Mock Server:', {
        messageCount: messages.length,
        model,
        maxTokens,
        temperature,
        timestamp: new Date().toISOString()
      });

      const openaiMessages = messages.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      const completion = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content || 'No response generated';
      const response: Message = {
        id: completion.id || `msg-${Date.now()}`,
        role: MessageRole.Assistant,
        content,
        contentType: detectContentType(content),
        timestamp: Date.now(),
        status: MessageStatus.Sent,
      };

      console.log('📥 Received response from Mock Server:', {
        id: response.id,
        contentLength: response.content.length,
        contentType: response.contentType,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('❌ Mock Server Error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to get response';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Mock server is not running. Please start it with: pnpm dev:mock';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  async sendMessageStream(
    messages: Message[],
    onChunk: (chunk: string) => void,
    onComplete: (message: Message) => void,
    options: ChatServiceOptions = {}
  ): Promise<void> {
    const { model = this.model, maxTokens = this.maxTokens, temperature = this.temperature } = options;

    try {
      console.log('📤 Starting streaming message to Mock Server:', {
        messageCount: messages.length,
        model,
        timestamp: new Date().toISOString()
      });

      const openaiMessages = messages.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      const stream = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      });

      let fullContent = '';
      let messageId = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          const content = delta.content;
          fullContent += content;
          onChunk(content);
        }
        
        if (chunk.id && !messageId) {
          messageId = chunk.id;
        }
      }

      const finalMessage: Message = {
        id: messageId || `msg-${Date.now()}`,
        role: MessageRole.Assistant,
        content: fullContent,
        contentType: detectContentType(fullContent),
        timestamp: Date.now(),
        status: MessageStatus.Sent,
      };

      console.log('✅ Streaming completed from Mock Server:', {
        id: finalMessage.id,
        contentLength: finalMessage.content.length,
        contentType: finalMessage.contentType,
        timestamp: new Date().toISOString()
      });

      onComplete(finalMessage);
    } catch (error) {
      console.error('❌ Mock Server Streaming Error:', error);
      
      let errorMessage = 'Failed to stream response';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Mock server is not running. Please start it with: pnpm dev:mock';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  // Health check for mock server
  async checkMockServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${MOCK_SERVER_URL}/health`);
      const data = await response.json();
      console.log('🏥 Mock Server Health:', data);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Mock Server health check failed:', error);
      return false;
    }
  }

  // Get mock server configuration
  async getMockServerConfig() {
    try {
      const response = await fetch(`${MOCK_SERVER_URL}/config`);
      const config = await response.json();
      console.log('⚙️ Mock Server Config:', config);
      return config;
    } catch (error) {
      console.warn('⚠️ Failed to get Mock Server config:', error);
      return null;
    }
  }
} 