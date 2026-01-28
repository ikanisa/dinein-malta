/**
 * MoltyChat - AI Waiter Chat Component
 * 
 * A floating chat modal for interacting with Molty AI assistant.
 * Features:
 * - Message bubbles with streaming support
 * - Quick action chips
 * - Typing indicator
 * - Close/minimize functionality
 */

import { useState, useRef, useEffect } from 'react'
import { useMoltyChat } from '../hooks/useMoltyChat'

interface MoltyChatProps {
    venueId?: string
    venueName?: string
    tableNo?: string
    isOpen: boolean
    onClose: () => void
}

export function MoltyChat({ venueId, venueName, tableNo, isOpen, onClose }: MoltyChatProps) {
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const {
        messages,
        currentResponse,
        isLoading,
        isStreaming,
        error,
        sendMessage,
        cancelStream,
        showMenu,
        showPopularItems,
        showVegetarianOptions,
        viewCart,
    } = useMoltyChat({ venueId, tableNo })

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, currentResponse])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage(input)
        setInput('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Chat Modal */}
            <div className="relative w-full sm:max-w-md h-[85vh] sm:h-[600px] bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg">🤖</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Molty</h3>
                            <p className="text-xs text-muted-foreground">
                                {venueName || 'AI Waiter'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                    ))}

                    {/* Streaming response */}
                    {isStreaming && currentResponse && (
                        <MessageBubble
                            message={{ role: 'assistant', content: currentResponse }}
                            isStreaming
                        />
                    )}

                    {/* Loading indicator */}
                    {isLoading && !currentResponse && (
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">🤖</span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-muted max-w-[80%]">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                )}

                {/* Quick Actions (show when few messages) */}
                {messages.length <= 2 && !isLoading && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2">
                        <QuickChip label="📋 Menu" onClick={showMenu} />
                        <QuickChip label="⭐ Popular" onClick={showPopularItems} />
                        <QuickChip label="🥗 Vegetarian" onClick={showVegetarianOptions} />
                        <QuickChip label="🛒 My Cart" onClick={viewCart} />
                    </div>
                )}

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t bg-background flex gap-2"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about the menu..."
                        className="flex-1 px-4 py-2 rounded-full bg-muted border-none outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={cancelStream}
                            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            aria-label="Stop"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            aria-label="Send"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

/**
 * Message bubble component
 */
function MessageBubble({
    message,
    isStreaming = false
}: {
    message: { role: 'user' | 'assistant'; content: string }
    isStreaming?: boolean
}) {
    const isUser = message.role === 'user'

    return (
        <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                </div>
            )}
            <div
                className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${isUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5" />
                )}
            </div>
        </div>
    )
}

/**
 * Typing indicator (three dots animation)
 */
function TypingIndicator() {
    return (
        <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    )
}

/**
 * Quick action chip
 */
function QuickChip({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
            {label}
        </button>
    )
}

/**
 * Floating Action Button for opening chat
 */
export function MoltyChatFAB({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
            aria-label="Chat with Molty"
        >
            <span className="text-2xl">💬</span>
        </button>
    )
}
