import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Message as MessageType, MessageRole, MessageStatus } from '../../types/chat';
import { useChatStore } from '../../store/chatStore';
import { MessageEditor } from './MessageEditor';
import { useA11y } from '../../hooks/useA11y';
import { useMemoizedValue } from '../../utils/performance';
import { CodeBlock } from '../CodeBlock';

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && language ? (
      <CodeBlock
        code={String(children).replace(/\n$/, '')}
        language={language}
        showLineNumbers={true}
      />
    ) : (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  table({ children }: any) {
    return (
      <div className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }: any) {
    return (
      <thead className="bg-gray-50 dark:bg-gray-800">
        {children}
      </thead>
    );
  },
  th({ children }: any) {
    return (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
      </th>
    );
  },
  td({ children }: any) {
    return (
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        {children}
      </td>
    );
  },
  ul({ children }: any) {
    return (
      <ul className="list-disc list-inside space-y-1 my-3 ml-4">
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol className="list-decimal list-inside space-y-1 my-3 ml-4">
        {children}
      </ol>
    );
  },
  h1({ children }: any) {
    return (
      <h1 className="text-2xl font-bold my-4 text-gray-900 dark:text-gray-100">
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2 className="text-xl font-bold my-3 text-gray-900 dark:text-gray-100">
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3 className="text-lg font-semibold my-2 text-gray-900 dark:text-gray-100">
        {children}
      </h3>
    );
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 text-gray-600 dark:text-gray-400 italic">
        {children}
      </blockquote>
    );
  },
  a({ children, href }: any) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
      >
        {children}
      </a>
    );
  },
};

export const Message: React.FC<{ message: MessageType }> = memo(({ message }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { regenerateResponse, isStreaming } = useChatStore();
  const isUser = message.role === MessageRole.User;
  
  // 스트리밍 중이 아닐 때만 memoization 적용
  const memoizedContent = useMemoizedValue(message.content, isStreaming ? 0 : 300);

  const { getA11yProps } = useA11y({
    messages: [message],
    isStreaming,
  });

  const renderContent = () => {
    if (isEditing) {
      return (
        <MessageEditor
          message={message}
          onClose={() => setIsEditing(false)}
        />
      );
    }

    switch (message.contentType) {
      case 'markdown':
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-gray">
            <ReactMarkdown components={MarkdownComponents}>
              {memoizedContent}
            </ReactMarkdown>
          </div>
        );
      case 'html':
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(memoizedContent),
            }}
            className="prose prose-sm max-w-none dark:prose-invert prose-gray"
          />
        );
      case 'json':
        try {
          return (
            <CodeBlock
              code={JSON.stringify(JSON.parse(memoizedContent), null, 2)}
              language="json"
              showLineNumbers={false}
            />
          );
        } catch {
          return <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto text-sm">{memoizedContent}</pre>;
        }
      default:
        return (
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
            {memoizedContent}
          </div>
        );
    }
  };

  const renderStatus = () => {
    switch (message.status) {
      case MessageStatus.Sending:
        return (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-gray-400 text-xs">전송 중...</span>
          </div>
        );
      case MessageStatus.Error:
        return (
          <div className="flex items-center gap-2 mt-2 text-red-500 dark:text-red-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">{message.error}</span>
            <button
              onClick={() => regenerateResponse()}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs underline"
              aria-label="메시지 재전송"
            >
              다시 시도
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`group relative py-6 px-4 message-container ${isUser ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...getA11yProps(message.role)}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {isUser ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* 메시지 내용 */}
          <div className="flex-1 min-w-0" style={{ position: 'relative' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {isUser ? '사용자' : 'AI 어시스턴트'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.contentType !== 'text' && (
                <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {message.contentType.toUpperCase()}
                </span>
              )}
            </div>
            
            {/* 메시지 콘텐츠 컨테이너 - 고정 영역 예약 */}
            <div className="text-gray-900 dark:text-gray-100" style={{ minHeight: isEditing ? '120px' : '20px' }}>
              {renderContent()}
            </div>
            
            {renderStatus()}

            {/* 액션 버튼들 - absolute positioning으로 레이아웃에 영향 없게 처리 */}
            {!isStreaming && message.status === MessageStatus.Sent && (showActions || isEditing) && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 px-2 py-1 hover-actions">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label={isEditing ? '편집 취소' : '메시지 편집'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditing ? '취소' : '편집'}
                </button>
                
                {!isUser && (
                  <button
                    onClick={() => regenerateResponse()}
                    disabled={isStreaming}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                    aria-label="응답 재생성"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    재생성
                  </button>
                )}

                <button
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="메시지 복사"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  복사
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}); 