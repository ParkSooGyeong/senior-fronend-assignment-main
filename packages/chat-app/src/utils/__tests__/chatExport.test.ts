import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportChat, importFromJSON, downloadChat, readChatFile } from '../chatExport';
import { Message, MessageRole, MessageStatus } from '../../types/chat';

describe('chatExport', () => {
  const sampleMessages: Message[] = [
    {
      id: '1',
      role: MessageRole.User,
      content: '안녕하세요',
      contentType: 'text',
      timestamp: 1642582800000,
      status: MessageStatus.Sent,
    },
    {
      id: '2',
      role: MessageRole.Assistant,
      content: '안녕하세요! 무엇을 도와드릴까요?',
      contentType: 'text',
      timestamp: 1642582805000,
      status: MessageStatus.Sent,
    },
  ];

  describe('exportChat', () => {
    it('메시지를 올바른 형식으로 내보내야 함', () => {
      const exported = exportChat(sampleMessages);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('version', '1.0');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('messages');
      expect(parsed.messages).toHaveLength(2);
      expect(parsed.messages[0]).toMatchObject(sampleMessages[0]);
    });

    it('빈 메시지 배열도 처리할 수 있어야 함', () => {
      const exported = exportChat([]);
      const parsed = JSON.parse(exported);

      expect(parsed.messages).toHaveLength(0);
      expect(parsed.version).toBe('1.0');
    });

    it('JSON 형식이 올바르게 포맷되어야 함', () => {
      const exported = exportChat(sampleMessages);
      
      expect(() => JSON.parse(exported)).not.toThrow();
      expect(exported).toContain('  "version"');
    });
  });

  describe('importFromJSON', () => {
    it('올바른 형식의 데이터를 가져올 수 있어야 함', () => {
      const exportedData = exportChat(sampleMessages);
      const imported = importFromJSON(exportedData);

      expect(imported).toHaveLength(2);
      expect(imported[0]).toMatchObject(sampleMessages[0]);
      expect(imported[1]).toMatchObject(sampleMessages[1]);
    });

    it('잘못된 JSON 형식에 대해 오류를 던져야 함', () => {
      const invalidJson = '{ invalid json }';

      expect(() => importFromJSON(invalidJson)).toThrow('채팅 가져오기 실패');
    });

    it('지원하지 않는 버전에 대해 오류를 던져야 함', () => {
      const unsupportedVersion = JSON.stringify({
        version: '2.0',
        timestamp: Date.now(),
        messages: [],
      });

      expect(() => importFromJSON(unsupportedVersion)).toThrow('지원하지 않는 파일 형식입니다');
    });

    it('messages가 배열이 아닌 경우 오류를 던져야 함', () => {
      const invalidData = JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        messages: 'not an array',
      });

      expect(() => importFromJSON(invalidData)).toThrow('잘못된 메시지 형식입니다');
    });

    it('필수 필드가 누락된 메시지에 대해 오류를 던져야 함', () => {
      const invalidMessage = JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        messages: [
          {
            id: '1',
            content: 'test',
            contentType: 'text',
            timestamp: Date.now(),
            status: 'sent',
          },
        ],
      });

      expect(() => importFromJSON(invalidMessage)).toThrow('잘못된 메시지 형식입니다');
    });
  });

  describe('downloadChat', () => {
    beforeEach(() => {
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement as any);
      
      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
      global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('다운로드를 트리거해야 함', () => {
      downloadChat(sampleMessages);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('올바른 파일명을 설정해야 함', () => {
      const mockElement = document.createElement('a');
      downloadChat(sampleMessages);

      expect(mockElement.download).toMatch(/^chat-export-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('readChatFile', () => {
    it('파일에서 메시지를 읽을 수 있어야 함', async () => {
      const exportedData = exportChat(sampleMessages);
      const file = new File([exportedData], 'test.json', { type: 'application/json' });

      const result = await readChatFile(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(sampleMessages[0]);
    });

    it('잘못된 파일 내용에 대해 오류를 던져야 함', async () => {
      const invalidFile = new File(['invalid content'], 'test.json', { type: 'application/json' });

      await expect(readChatFile(invalidFile)).rejects.toThrow();
    });

    it('FileReader 오류를 처리해야 함', async () => {
      const file = new File(['test'], 'test.json', { type: 'application/json' });
      
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        readAsText = vi.fn().mockImplementation(() => {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('File read error') as any);
            }
          }, 0);
        });
        onerror: ((error: any) => void) | null = null;
        onload: ((event: any) => void) | null = null;
      } as any;

      await expect(readChatFile(file)).rejects.toThrow('파일을 읽는 중 오류가 발생했습니다');

      global.FileReader = originalFileReader;
    });
  });
}); 