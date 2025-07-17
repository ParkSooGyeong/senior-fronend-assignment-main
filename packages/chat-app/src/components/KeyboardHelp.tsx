import React, { useState } from 'react';

interface ShortcutItem {
  key: string;
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  { key: '↑/k', description: '이전 메시지로 이동', category: '탐색' },
  { key: '↓/j', description: '다음 메시지로 이동', category: '탐색' },
  { key: 'Home', description: '첫 메시지로 이동', category: '탐색' },
  { key: 'End', description: '마지막 메시지로 이동', category: '탐색' },
  { key: 'Enter', description: '선택한 메시지 편집', category: '편집' },
  { key: 'e', description: '선택한 메시지 편집', category: '편집' },
  { key: 'r', description: '선택한 메시지 재생성', category: '편집' },
  { key: 'Ctrl+F', description: '메시지 검색', category: '검색' },
  { key: 'Esc', description: '검색 닫기 / 선택 취소', category: '일반' },
  { key: '?', description: '단축키 도움말 표시/숨기기', category: '일반' },
  { key: 'Shift+Enter', description: '메시지 입력 시 줄바꿈', category: '입력' },
  { key: 'Enter', description: '메시지 전송', category: '입력' },
];

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = [];
  }
  acc[shortcut.category].push(shortcut);
  return acc;
}, {} as Record<string, ShortcutItem[]>);

export const KeyboardHelp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setIsVisible(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">키보드 단축키</h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="도움말 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map(({ key, description }) => (
                    <div
                      key={`${category}-${key}-${description}`}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">{description}</span>
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">팁</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• 메시지 위에 마우스를 올리면 편집/재생성 버튼이 나타납니다</li>
                    <li>• 빠른 예시 버튼을 클릭하여 다양한 콘텐츠 타입을 체험해보세요</li>
                    <li>• 스트리밍 중에는 취소 버튼으로 응답을 중단할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>단축키를 사용하여 더 빠르게 작업하세요</span>
            <span>언제든 <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">?</kbd> 키를 눌러주세요</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 