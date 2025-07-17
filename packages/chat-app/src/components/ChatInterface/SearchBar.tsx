import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from '../../utils/performance';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  matchCount: number;
  currentMatch: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onNext,
  onPrevious,
  matchCount,
  currentMatch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(onSearch, 300);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        onSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSearch]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    onSearch('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="검색 (Ctrl+F)"
        title="검색 (Ctrl+F)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    );
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={handleClose}
      />
      
      {/* 검색 모달 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          {/* 검색 입력 */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="메시지 검색..."
              className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 검색 결과 및 네비게이션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {matchCount > 0 ? (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {currentMatch} / {matchCount} 결과
                </span>
              ) : searchQuery ? (
                <span className="text-sm text-gray-400">결과 없음</span>
              ) : (
                <span className="text-sm text-gray-400">Ctrl+F로 검색</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {matchCount > 0 && (
                <>
                  <button
                    onClick={onPrevious}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="이전 결과"
                    title="이전 결과 (Shift+F3)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={onNext}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="다음 결과"
                    title="다음 결과 (F3)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              <button
                onClick={handleClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
                aria-label="검색 닫기"
                title="닫기 (Esc)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 키보드 단축키 안내 */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>💡 <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+F</kbd> 검색</span>
              <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> 닫기</span>
              <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> 다음</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 