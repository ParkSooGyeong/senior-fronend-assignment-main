import { create } from 'zustand';
import { Message, MessageRole, MessageStatus } from '../types/chat';
import { ChatService } from '../services/chatService';

const STORAGE_KEY = 'chat_history';

interface SearchState {
  searchQuery: string;
  searchResults: number[];
  currentMatchIndex: number;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  isOffline: boolean;
  search: SearchState;
  chatService: ChatService;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  loadHistory: () => void;
  saveHistory: () => void;
  sendMessage: (content: string) => Promise<void>;
  regenerateResponse: () => Promise<void>;
  setOfflineMode: (isOffline: boolean) => void;
  cancelStream: () => void;
  setSearchQuery: (query: string) => void;
  nextSearchResult: () => void;
  previousSearchResult: () => void;
  clearSearch: () => void;
  checkMockServerHealth: () => Promise<boolean>;
}

const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

const saveMessagesToStorage = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

// findAllMatches function removed as it was unused

export const useChatStore = create<ChatState>((set, get) => {
  const chatService = ChatService.getInstance();

  return {
    messages: loadMessagesFromStorage(),
    isStreaming: false,
    error: null,
    isOffline: !navigator.onLine,
    chatService,
    search: {
      searchQuery: '',
      searchResults: [],
      currentMatchIndex: -1,
    },

    addMessage: (message) => {
      set((state) => {
        const newMessages = [...state.messages, message];
        saveMessagesToStorage(newMessages);
        return { messages: newMessages };
      });
    },

    updateLastMessage: (content) => {
      set((state) => {
        const messages = [...state.messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === MessageRole.Assistant) {
          messages[messages.length - 1] = { ...lastMessage, content };
          saveMessagesToStorage(messages);
        }
        return { messages };
      });
    },

    setIsStreaming: (isStreaming) => set({ isStreaming }),
    
    setError: (error) => set({ error }),
    
    clearMessages: () => {
      set({ messages: [] });
      saveMessagesToStorage([]);
    },

    loadHistory: () => {
      const messages = loadMessagesFromStorage();
      set({ messages });
    },

    saveHistory: () => {
      const { messages } = get();
      saveMessagesToStorage(messages);
    },

    setOfflineMode: (isOffline) => {
      set({ isOffline });
    },

    sendMessage: async (content: string) => {
      const { messages, chatService } = get();
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: MessageRole.User,
        content,
        contentType: 'text',
        timestamp: Date.now(),
        status: MessageStatus.Sent,
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
        isStreaming: true,
        error: null,
      }));

      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: MessageRole.Assistant,
        content: '',
        contentType: 'text',
        timestamp: Date.now(),
        status: MessageStatus.Sending,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));

      try {
        await chatService.sendMessageStream(
          [...messages, userMessage],
          (chunk: string) => {
            set((state) => {
              const messages = [...state.messages];
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.id === assistantMessageId) {
                messages[messages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + chunk,
                };
              }
              return { messages };
            });
          },
          (finalMessage: Message) => {
            set((state) => {
              const messages = [...state.messages];
              messages[messages.length - 1] = {
                ...finalMessage,
                id: assistantMessageId,
              };
              saveMessagesToStorage(messages);
              return { messages, isStreaming: false };
            });
          }
        );
      } catch (error) {
        console.error('Chat error:', error);
        set((state) => {
          const messages = [...state.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.id === assistantMessageId) {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: error instanceof Error ? error.message : 'Failed to get response',
              status: MessageStatus.Error,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
          return {
            messages,
            isStreaming: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        });
      }
    },

    regenerateResponse: async () => {
      const { messages, chatService, isStreaming } = get();
      if (messages.length === 0 || isStreaming) return;

      set({ isStreaming: true, error: null });

      let lastAssistantMessageIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === MessageRole.Assistant) {
          lastAssistantMessageIndex = i;
          break;
        }
      }

      if (lastAssistantMessageIndex === -1) return;

      set((state) => ({
        messages: state.messages.slice(0, lastAssistantMessageIndex),
      }));

      const contextMessages = messages.slice(0, lastAssistantMessageIndex);
      
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: MessageRole.Assistant,
        content: '',
        contentType: 'text',
        timestamp: Date.now(),
        status: MessageStatus.Sending,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
      }));

      try {
        await chatService.sendMessageStream(
          contextMessages,
          (chunk: string) => {
            set((state) => {
              const messages = [...state.messages];
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.id === assistantMessageId) {
                messages[messages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + chunk,
                };
              }
              return { messages };
            });
          },
          (finalMessage: Message) => {
            set((state) => {
              const messages = [...state.messages];
              messages[messages.length - 1] = {
                ...finalMessage,
                id: assistantMessageId,
              };
              saveMessagesToStorage(messages);
              return { messages, isStreaming: false };
            });
          }
        );
      } catch (error) {
        console.error('Regeneration error:', error);
        set((state) => {
          const messages = [...state.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.id === assistantMessageId) {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: error instanceof Error ? error.message : 'Failed to regenerate response',
              status: MessageStatus.Error,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
          return {
            messages,
            isStreaming: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        });
      }
    },

    cancelStream: () => {
      set({ isStreaming: false });
    },

    checkMockServerHealth: async () => {
      const { chatService } = get();
      return await chatService.checkMockServerHealth();
    },

    setSearchQuery: (query: string) => {
      const { messages } = get();
      const results: number[] = [];
      
      if (query) {
        messages.forEach((message, index) => {
          if (message.content.toLowerCase().includes(query.toLowerCase())) {
            results.push(index);
          }
        });
      }

      set((state) => ({
        search: {
          ...state.search,
          searchQuery: query,
          searchResults: results,
          currentMatchIndex: results.length > 0 ? 0 : -1,
        },
      }));
    },

    nextSearchResult: () => {
      set((state) => ({
        search: {
          ...state.search,
          currentMatchIndex:
            (state.search.currentMatchIndex + 1) % state.search.searchResults.length,
        },
      }));
    },

    previousSearchResult: () => {
      set((state) => ({
        search: {
          ...state.search,
          currentMatchIndex:
            (state.search.currentMatchIndex - 1 + state.search.searchResults.length) %
            state.search.searchResults.length,
        },
      }));
    },

    clearSearch: () => {
      set(() => ({
        search: {
          searchQuery: '',
          searchResults: [],
          currentMatchIndex: -1,
        },
      }));
    },
  };
}); 