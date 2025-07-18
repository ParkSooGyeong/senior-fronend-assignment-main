import React, { useEffect, useRef, memo, useCallback, useState } from 'react';
import { useThrottle, useDebounce } from '../../utils/performance';
import { Message } from './Message';
import { useChatStore } from '../../store/chatStore';

import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useA11y } from '../../hooks/useA11y';
import { VirtualScroller, VirtualScrollerRef } from '../VirtualScroller';
import { Message as MessageType } from '../../types/chat';

const ESTIMATED_MESSAGE_HEIGHT = 200; // 메시지 높이를 더 크게 설정

interface MessageListProps {
  highlightedMessageIndex?: number;
  searchQuery: string;
}

const MessageItem = memo<{
  message: MessageType;
  isSelected: boolean;
  isHighlighted: boolean;
  searchQuery: string;
}>(({ message, isSelected, isHighlighted, searchQuery }) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isHighlighted]);

  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={messageRef}
      className={`message-item ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${
        isHighlighted ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
      }`}
      style={{ contain: 'layout style paint' }}
      role="option"
      aria-selected={isSelected}
      id={`message-${message.id}`}
    >
      <Message
        message={{
          ...message,
          content: searchQuery ? highlightText(message.content) as any : message.content,
        }}
      />
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export const MessageList: React.FC<MessageListProps> = ({
  highlightedMessageIndex,
  searchQuery,
}) => {
  const { messages, isStreaming } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualScrollerRef = useRef<VirtualScrollerRef>(null);

  const { getA11yProps } = useA11y({
    messages,
    isStreaming: false,
  });

  const handleMessageSelect = useCallback((index: number) => {
    const message = messages[index];
    if (!message) return;

    const element = document.getElementById(`message-${message.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const {
    focusedIndex,
    getItemProps,
    getContainerProps
  } = useKeyboardNavigation({
    itemCount: messages.length,
    onSelect: handleMessageSelect,
    enabled: true,
    loop: false,
  });

  // 사용자가 맨 아래에 있는지 확인하는 상태
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const lastScrollTimeRef = useRef<number>(0);
  const lastMessageCountRef = useRef<number>(0);
  const wasStreamingRef = useRef(false);

  // 스크롤 위치 모니터링
  const handleScroll = useCallback((scrollTop: number, scrollHeight?: number, clientHeight?: number) => {
    if (!scrollHeight || !clientHeight) return;

    const threshold = 50;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    setIsUserAtBottom(isAtBottom);
  }, []);

  // 자동 스크롤 함수
  const scrollToBottom = useCallback(() => {
    if (!virtualScrollerRef.current) return;
    
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 200) return;
    
    lastScrollTimeRef.current = now;
    virtualScrollerRef.current.scrollToBottom();
  }, []);

  // 메시지 변화 감지 및 자동 스크롤
  useEffect(() => {
    const messageCountChanged = messages.length > lastMessageCountRef.current;
    const streamingChanged = wasStreamingRef.current !== isStreaming;
    const streamingEnded = wasStreamingRef.current && !isStreaming;
    
    // 새 메시지가 추가되었거나 스트리밍이 끝났을 때 스크롤
    if ((messageCountChanged || streamingEnded) && isUserAtBottom) {
      setTimeout(scrollToBottom, 50);
    }
    
    lastMessageCountRef.current = messages.length;
    wasStreamingRef.current = isStreaming;
  }, [messages.length, isStreaming, isUserAtBottom, scrollToBottom]);

  const renderMessage = useCallback((message: MessageType, index: number) => (
    <MessageItem
      key={message.id}
      message={message}
      isSelected={index === focusedIndex}
      isHighlighted={index === highlightedMessageIndex}
      searchQuery={searchQuery}
      {...getItemProps(index)}
    />
  ), [focusedIndex, highlightedMessageIndex, searchQuery, getItemProps]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            대화를 시작해보세요!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            아래 메시지 입력창에 질문을 입력하거나 예시 버튼을 클릭해보세요.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: "📝", text: "마크다운 예시", desc: "markdown 예시를 보여주세요" },
              { icon: "🔖", text: "HTML 예시", desc: "html 태그 예시를 주세요" },
              { icon: "📊", text: "JSON 데이터", desc: "json 형태로 데이터를 주세요" },
              { icon: "👋", text: "인사하기", desc: "안녕하세요" }
            ].map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-medium text-gray-700 dark:text-gray-300">{item.text}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">"{item.desc}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getContainerProps()}
      ref={containerRef}
      className="h-full overflow-y-auto"
      {...getA11yProps('list')}
    >
      <VirtualScroller
        ref={virtualScrollerRef}
        items={messages}
        itemHeight={ESTIMATED_MESSAGE_HEIGHT}
        overscan={3}
        renderItem={renderMessage}
        className="h-full"
        onScroll={handleScroll}
      />
    </div>
  );
}; 