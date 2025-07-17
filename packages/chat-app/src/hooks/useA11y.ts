import { useEffect, useCallback, useRef } from 'react';
import { Message } from '../types/chat';

interface UseA11yOptions {
  messages: Message[];
  isStreaming: boolean;
}

export const useA11y = ({ messages, isStreaming }: UseA11yOptions) => {
  const announcer = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string) => {
    if (!announcer.current) {
      announcer.current = document.createElement('div');
      announcer.current.setAttribute('aria-live', 'polite');
      announcer.current.setAttribute('aria-atomic', 'true');
      announcer.current.className = 'sr-only';
      document.body.appendChild(announcer.current);
    }
    announcer.current.textContent = message;
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const role = lastMessage.role === 'user' ? '사용자' : 'AI';
      announce(`${role}의 새 메시지: ${lastMessage.content}`);
    }
  }, [messages, announce]);

  useEffect(() => {
    if (isStreaming) {
      announce('AI가 응답을 생성하고 있습니다...');
    }
  }, [isStreaming, announce]);

  useEffect(() => {
    return () => {
      if (announcer.current && announcer.current.parentNode) {
        try {
          announcer.current.parentNode.removeChild(announcer.current);
        } catch (error) {
          console.debug('Announcer already removed from DOM');
        }
      }
    };
  }, []);

  const getA11yProps = useCallback((role: string) => {
    return {
      role: 'listitem',
      'aria-label': `${role === 'user' ? '사용자' : 'AI'} 메시지`,
    };
  }, []);

  return {
    getA11yProps,
    announce,
  };
}; 