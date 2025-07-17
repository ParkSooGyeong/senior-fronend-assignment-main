import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OfflineIndicator } from './OfflineIndicator';
import { ThemeToggle } from '../ThemeToggle';
import { KeyboardHelp } from '../KeyboardHelp';
import { SearchBar } from './SearchBar';
import { ChatExportImport } from './ChatExportImport';
import { useChatStore } from '../../store/chatStore';

export const ChatInterface: React.FC = () => {
  const {
    loadHistory,
    isStreaming,
    error,
    setError,
    cancelStream,
    search,
    setSearchQuery,
    nextSearchResult,
    previousSearchResult,
    clearMessages,
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Chat</h1>
          <OfflineIndicator />
        </div>
        
        <div className="flex items-center gap-2">
          <SearchBar
            onSearch={setSearchQuery}
            onNext={nextSearchResult}
            onPrevious={previousSearchResult}
            matchCount={search.searchResults.length}
            currentMatch={search.currentMatchIndex + 1}
          />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="설정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <ThemeToggle />
        </div>
      </header>

      {/* 설정 패널 */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">채팅 관리</h3>
            <div className="flex items-center gap-2">
              <ChatExportImport />
              <button
                onClick={clearMessages}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                대화 초기화
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 메시지 영역 */}
      <main className="flex-1 overflow-hidden relative">
        <MessageList
          highlightedMessageIndex={
            search.currentMatchIndex !== -1
              ? search.searchResults[search.currentMatchIndex]
              : undefined
          }
          searchQuery={search.searchQuery}
        />
        
        {/* 스트리밍 중 취소 버튼 */}
        {isStreaming && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={cancelStream}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              응답 중단
            </button>
          </div>
        )}
        
        {/* 에러 메시지 */}
        {error && (
          <div className="absolute bottom-4 left-4 right-20 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-sm">오류가 발생했습니다</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              {/* X 버튼 */}
              <button
                onClick={() => setError(null)}
                className="flex items-center justify-center w-5 h-5 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors ml-2"
                aria-label="오류 메시지 닫기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 입력 영역 */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4">
          <MessageInput />
        </div>
      </footer>

      <KeyboardHelp />
    </div>
  );
}; 