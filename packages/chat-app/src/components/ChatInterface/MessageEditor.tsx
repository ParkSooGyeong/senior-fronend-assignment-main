import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageRole } from '../../types/chat';
import { useChatStore } from '../../store/chatStore';

interface MessageEditorProps {
  message: Message;
  onClose: () => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({ message, onClose }) => {
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { regenerateResponse } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editedContent.length, editedContent.length);
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (message.role === MessageRole.User) {
        await regenerateResponse();
      }
      onClose();
    } catch (error) {
      console.error('Failed to regenerate response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">메시지 편집</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
            aria-label="편집 취소"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 편집 영역 */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="w-full resize-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
            placeholder="메시지를 입력하세요..."
            disabled={isSubmitting}
            rows={3}
            style={{ minHeight: '80px' }}
            aria-label="메시지 편집"
          />
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>💡 <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+Enter</kbd>로 저장</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd>로 취소</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!editedContent.trim() || isSubmitting}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  저장
                </>
              )}
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        {message.role === MessageRole.User && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                사용자 메시지를 수정하면 AI가 새로운 응답을 생성합니다.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 