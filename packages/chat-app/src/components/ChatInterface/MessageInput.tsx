import React, { useState, useRef, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';

export const MessageInput: React.FC = () => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, error } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    try {
      await sendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 144; // 6 lines * 24px line height
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  const canSend = input.trim() && !isStreaming;

  return (
    <div className="relative">
      {/* 주요 입력 영역 */}
      <div className="relative flex items-end gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "AI가 응답 중입니다..." : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"}
            className="w-full resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-0 outline-none focus:ring-0 text-base leading-6"
            disabled={isStreaming}
            rows={1}
            style={{ minHeight: '24px', maxHeight: '144px' }}
            aria-label="메시지 입력"
          />
        </div>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!canSend}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            canSend
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          aria-label="메시지 전송"
        >
          {isStreaming ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* 도움말 텍스트 */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
          {error && (
            <span className="text-red-500 dark:text-red-400">
              ⚠️ 전송 실패
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span>AI가 도움을 드릴게요</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 빠른 예시 버튼들 */}
      {!isStreaming && input.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { text: "markdown 예시를 보여주세요", icon: "📝" },
            { text: "html 태그 예시를 주세요", icon: "🔖" },
            { text: "json 형태로 데이터를 주세요", icon: "📊" },
            { text: "안녕하세요", icon: "👋" }
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInput(example.text)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span>{example.icon}</span>
              <span>{example.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 