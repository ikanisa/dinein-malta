import { useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useChat, ChatKitProvider } from '@/lib/chatkit/ChatKitContext';
import { WidgetRenderer } from '@/lib/chatkit/WidgetRenderer';
import { Button } from '@/components/ui/Button';

function ChatView() {
    const { messages, sendMessage, isLoading } = useChat();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white px-4 py-3 flex items-center shadow-sm z-10 sticky top-0">
                <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="ml-3">
                    <h1 className="font-bold text-slate-900">Waiter AI</h1>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </p>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                        <p>Ask anything about the menu!</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                            }`}>
                            {msg.content.map((part, idx) => {
                                if (part.type === 'text') {
                                    return <p key={idx} className="whitespace-pre-wrap leading-relaxed">{part.text}</p>;
                                }
                                if (part.type === 'widget') {
                                    return (
                                        <div key={idx} className="mt-2">
                                            <WidgetRenderer type={part.widget.type} props={part.widget.props} />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-1 items-center h-[48px]">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="p-4 bg-white border-t border-slate-200 safe-area-bottom">
                <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-2 pr-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask for recommendations..."
                        className="flex-1 bg-transparent border-none focus:ring-0 p-2 min-h-[44px] max-h-[120px] resize-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        onClick={handleSend}
                        className={`mb-1 transition-all rounded-xl h-10 w-10 p-0 flex items-center justify-center ${inputValue.trim() ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-300'}`}
                        disabled={!inputValue.trim() || isLoading}
                    >
                        <Send size={18} className="text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Wrapper to provide context
export function ChatScreen() {
    return (
        <ChatKitProvider>
            <ChatView />
        </ChatKitProvider>
    );
}
