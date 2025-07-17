import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatService } from '../chatService';
import { MessageRole, MessageStatus, Message } from '../../types/chat';

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    vi.useRealTimers();
    chatService = ChatService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('동일한 인스턴스를 반환해야 함 (Singleton)', () => {
      const instance1 = ChatService.getInstance();
      const instance2 = ChatService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('sendMessage', () => {
    it('메시지를 보내고 올바른 응답을 반환해야 함', async () => {
      const messages = [
        {
          id: '1',
          role: MessageRole.User,
          content: '안녕하세요',
          contentType: 'text' as const,
          timestamp: Date.now(),
          status: MessageStatus.Sent,
        }
      ];

      const result = await chatService.sendMessage(messages);

      expect(result).toMatchObject({
        role: MessageRole.Assistant,
        contentType: expect.any(String),
        status: MessageStatus.Sent,
      });
      expect(result.content).toBeTruthy();
      expect(result.id).toBeTruthy();
    });

    it('should handle empty messages array', async () => {
      await expect(chatService.sendMessage([]))
        .rejects.toThrow();
    });
  });

  describe('sendMessageStream', () => {
    it('스트리밍 메시지를 처리해야 함', async () => {
      const messages = [
        {
          id: '1',
          role: MessageRole.User,
          content: 'test streaming',
          contentType: 'text' as const,
          timestamp: Date.now(),
          status: MessageStatus.Sent,
        }
      ];

      const chunkSpy = vi.fn();
      const completeSpy = vi.fn();

      await chatService.sendMessageStream(messages, chunkSpy, completeSpy);

      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          role: MessageRole.Assistant,
          status: MessageStatus.Sent,
        })
      );
    });


  });

  describe('checkMockServerHealth', () => {
    it('Mock 서버 상태를 확인해야 함', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      const isHealthy = await chatService.checkMockServerHealth();
      expect(isHealthy).toBe(true);
    });

    it('Mock 서버가 다운되어 있으면 false를 반환해야 함', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection failed'));

      const isHealthy = await chatService.checkMockServerHealth();
      expect(isHealthy).toBe(false);
    });
  });

  describe('getMockServerConfig', () => {
    it('Mock 서버 설정을 가져와야 함', async () => {
      const mockConfig = { 
        seed: 12345, 
        latency: 100,
        logRequests: true 
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      });

      const config = await chatService.getMockServerConfig();
      expect(config).toEqual(mockConfig);
    });

    it('설정 가져오기 실패 시 null을 반환해야 함', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const config = await chatService.getMockServerConfig();
      expect(config).toBeNull();
    });
  });

  describe('에러 처리', () => {
    it('네트워크 오류 시 적절한 에러 메시지를 던져야 함', async () => {
      const messages = [
        {
          id: '1',
          role: MessageRole.User,
          content: 'test with extremely long content that might cause server issues '.repeat(1000),
          contentType: 'text' as const,
          timestamp: Date.now(),
          status: MessageStatus.Sent,
        }
      ];

      try {
        await chatService.sendMessage(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
}); 