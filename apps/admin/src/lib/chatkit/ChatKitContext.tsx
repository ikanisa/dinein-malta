import { createContext, useContext, ReactNode } from 'react';
import { useChatKit } from './useChatKit';
import { Message } from './types';

interface ChatKitContextValue {
    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    isLoading: boolean;
}

const ChatKitContext = createContext<ChatKitContextValue | null>(null);

export function ChatKitProvider({ children }: { children: ReactNode }) {
    const chat = useChatKit();

    return (
        <ChatKitContext.Provider value={chat}>
            {children}
        </ChatKitContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatKitContext);
    if (!context) throw new Error("useChat must be used within ChatKitProvider");
    return context;
}
