import { Message } from '../types/chat';

interface ChatExport {
  version: string;
  timestamp: number;
  messages: Message[];
}

export const exportChat = (messages: Message[]): string => {
  const exportData: ChatExport = {
    version: '1.0',
    timestamp: Date.now(),
    messages,
  };

  return JSON.stringify(exportData, null, 2);
};

export const importFromJSON = (jsonString: string): Message[] => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version || !data.messages) {
      throw new Error('Invalid chat export format');
    }

    if (!Array.isArray(data.messages)) {
      throw new Error('Messages must be an array');
    }

    data.messages.forEach((message: any, index: number) => {
      if (!message.id || !message.role || !message.content) {
        throw new Error(`Invalid message at index ${index}: missing required fields`);
      }
    });

    return data.messages;
  } catch (error) {
    throw new Error(`Failed to import chat data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadChat = (messages: Message[]) => {
  const exportData = exportChat(messages);
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readChatFile = (file: File): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error('파일을 읽을 수 없습니다.');
        }
        const messages = importFromJSON(content);
        resolve(messages);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };

    reader.readAsText(file);
  });
}; 