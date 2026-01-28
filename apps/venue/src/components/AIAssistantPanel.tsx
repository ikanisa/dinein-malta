/**
 * AIAssistantPanel - Embedded AI chat panel for venue owners
 * 
 * Provides quick access to Molty for:
 * - Checking order status
 * - Viewing sales summaries
 * - Updating orders
 */

import { useState, useRef, useEffect } from 'react'
import { Card } from '@dinein/ui'
import { Bot, Send, X, Loader2, RefreshCw } from 'lucide-react'
import { useVenueMoltyChat } from '../hooks/useVenueMoltyChat'

interface AIAssistantPanelProps {
    venueId: string
    className?: string
}

export function AIAssistantPanel({ venueId, className = '' }: AIAssistantPanelProps) {
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
        clearChat,
        checkActiveOrders,
        getTodaysSales,
        getWeeklySummary,
    } = useVenueMoltyChat({ venueId })

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, currentResponse])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage(input)
        setInput('')
    }

    return (
        <Card className={`flex flex-col h-[400px] overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Molty Assistant</span>
                </div>
                <button
                    onClick={clearChat}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="Clear chat"
                >
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-muted text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <X className="h-3 w-3" />
                    {error}
                </div>
            )}

            {/* Quick Actions */}
            {messages.length <= 2 && !isLoading && (
                <div className="px-4 py-2 flex flex-wrap gap-2 border-t">
                    <QuickChip label="📋 Active orders" onClick={checkActiveOrders} />
                    <QuickChip label="💰 Today's sales" onClick={getTodaysSales} />
                    <QuickChip label="📊 Weekly summary" onClick={getWeeklySummary} />
                </div>
            )}

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-3 border-t flex gap-2"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about orders, sales..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={isLoading}
                />
                {isLoading ? (
                    <button
                        type="button"
                        onClick={cancelStream}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                )}
            </form>
        </Card>
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
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                </div>
            )}
            <div
                className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${isUser
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    }`}
            >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {isStreaming && (
                    <span className="inline-block w-1 h-3 bg-current animate-pulse ml-0.5" />
                )}
            </div>
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
            className="px-2.5 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
            {label}
        </button>
    )
}
