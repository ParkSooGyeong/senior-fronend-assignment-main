import React, { useEffect, useRef, memo, useCallback, useState } from 'react';
import { useThrottle, useDebounce } from '../../utils/performance';
import { Message } from './Message';
import { useChatStore } from '../../store/chatStore';

import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useA11y } from '../../hooks/useA11y';
import { VirtualScroller, VirtualScrollerRef } from '../VirtualScroller';
import { Message as MessageType } from '../../types/chat';

const ESTIMATED_MESSAGE_HEIGHT = 150; // 메시지 높이 조정

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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const lastScrollTimeRef = useRef<number>(0);
  const lastScrollHeightRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 스크롤 위치 모니터링 (throttled) - race condition 방지
  const throttledScrollHandler = useThrottle((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    // auto-scroll 중에는 사용자 스크롤 감지 무시
    if (isAutoScrolling) {
      console.log('🚫 Ignoring scroll during auto-scroll');
      return;
    }

    const threshold = 100; // 100px 여유로 증가
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    // 스크롤 높이가 변경되었을 때만 디버그 로그 출력
    if (lastScrollHeightRef.current !== scrollHeight) {
      console.log('📍 Scroll Position Debug:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        threshold,
        isAtBottom,
        difference: scrollHeight - (scrollTop + clientHeight),
        calculatedHeight: messages.length * ESTIMATED_MESSAGE_HEIGHT,
        heightDifference: scrollHeight - (messages.length * ESTIMATED_MESSAGE_HEIGHT)
      });
      lastScrollHeightRef.current = scrollHeight;
    }
    
    setIsUserAtBottom(isAtBottom);
    
    // 사용자가 수동으로 스크롤했을 때는 auto-scroll 잠시 비활성화
    if (!isAtBottom && !isAutoScrolling) {
      setShouldAutoScroll(false);
    }
  }, 250); // 더 긴 간격으로 throttle

  const handleScroll = useCallback((scrollTop: number, scrollHeight?: number, clientHeight?: number) => {
    if (scrollHeight && clientHeight) {
      throttledScrollHandler(scrollTop, scrollHeight, clientHeight);
    }
  }, [throttledScrollHandler, isAutoScrolling]);

  // 자동 스크롤 함수 (race condition 방지)
  const scrollToBottom = useCallback(() => {
    if (!virtualScrollerRef.current) return;
    
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 1000) {
      return; // 마지막 스크롤로부터 1초가 지나지 않았다면 무시
    }
    
    // 이전 타임아웃이 있다면 취소
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setIsAutoScrolling(true);
    lastScrollTimeRef.current = now;
    console.log('🚀 Starting auto-scroll');
    
    virtualScrollerRef.current.scrollToBottom();
    
    // auto-scroll 완료 후 플래그 해제
    scrollTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(false);
      console.log('✅ Auto-scroll completed');
      
      // 스크롤이 완료된 후 현재 스크롤 위치 확인
      if (virtualScrollerRef.current?.containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = virtualScrollerRef.current.containerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
        setIsUserAtBottom(isAtBottom);
        setShouldAutoScroll(isAtBottom);
      }
    }, 300); // smooth scroll 애니메이션 시간 고려
  }, []);

  // 디바운스된 자동 스크롤
  const debouncedScrollToBottom = useDebounce(scrollToBottom, 100);

  // 통합된 자동 스크롤 로직
  useEffect(() => {
    const shouldScroll = 
      messages.length > 0 && 
      !searchQuery && 
      shouldAutoScroll && 
      isUserAtBottom &&
      !isAutoScrolling; // auto-scroll 중이 아닐 때만

    if (shouldScroll) {
      console.log('🎯 Triggering auto-scroll', {
        messageCount: messages.length,
        isStreaming,
        shouldAutoScroll,
        isUserAtBottom,
        isAutoScrolling
      });
      debouncedScrollToBottom();
    }
  }, [messages.length, isStreaming, searchQuery, shouldAutoScroll, isUserAtBottom, isAutoScrolling, debouncedScrollToBottom]);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 사용자가 맨 아래에 있으면 auto-scroll 재활성화
  useEffect(() => {
    if (isUserAtBottom && !isAutoScrolling) {
      setShouldAutoScroll(true);
    }
  }, [isUserAtBottom, isAutoScrolling]);

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
        overscan={10}
        renderItem={renderMessage}
        className="h-full"
        onScroll={handleScroll}
      />
    </div>
  );
}; 