import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../../store/chatStore';
import { downloadChat, readChatFile } from '../../utils/chatExport';

export const ChatExportImport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, clearMessages, addMessage } = useChatStore();

  const handleExport = () => {
    try {
      downloadChat(messages);
      toast.success('채팅을 성공적으로 내보냈습니다', {
        icon: '📄',
        duration: 3000,
      });
      setIsOpen(false);
    } catch (error) {
      toast.error('채팅 내보내기에 실패했습니다', {
        icon: '❌',
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedMessages = await readChatFile(file);
      clearMessages();
      importedMessages.forEach(message => addMessage(message));
      setIsOpen(false);
      toast.success(`${importedMessages.length}개의 메시지를 가져왔습니다`, {
        icon: '📥',
        duration: 3000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '채팅 가져오기에 실패했습니다', {
        icon: '❌',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="채팅 내보내기/가져오기"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
        </svg>
        백업
      </button>

      {isOpen && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">채팅 백업</h3>
              
              <div className="space-y-3">
                {/* 내보내기 */}
                <div>
                  <button
                    onClick={handleExport}
                    disabled={messages.length === 0}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">채팅 내보내기</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">JSON 파일로 저장</div>
                    </div>
                  </button>
                  {messages.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1 px-3">메시지가 없습니다</p>
                  )}
                </div>

                {/* 가져오기 */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="chat-import"
                  />
                  <label
                    htmlFor="chat-import"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">채팅 가져오기</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">JSON 파일에서 복원</div>
                    </div>
                  </label>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 px-3">
                    ⚠️ 현재 대화가 삭제됩니다
                  </p>
                </div>
              </div>

              {/* 정보 */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>현재 메시지 수:</span>
                    <span className="font-medium">{messages.length}개</span>
                  </div>
                  {messages.length > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span>예상 파일 크기:</span>
                      <span className="font-medium">~{Math.round(JSON.stringify(messages).length / 1024)}KB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 