import { useState, useRef, useEffect } from 'react'
import { Button, Card } from '@dinein/ui'
import { MessageSquare, Send, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { useAdminChat, type PlatformSummary } from '@/lib/chatkit/useAdminChat'

/**
 * Admin AI Assistant Chat Component
 * Floating chat widget for platform administrators
 */
export function AdminAssistantChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Mock platform summary - in production, this comes from admin dashboard hooks
    const platformSummary: PlatformSummary = {
        totalVenues: 0,
        pendingClaims: 0,
        totalOrders: 0,
        totalRevenue: 0,
        currency: 'EUR',
    }

    const { messages, sendMessage, isLoading, error, clearMessages } = useAdminChat({
        platformSummary
    })

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        sendMessage(input)
        setInput('')
    }

    const quickActions = [
        { label: '📋 Pending claims', message: 'Show me pending venue claims' },
        { label: '📊 Platform stats', message: 'Give me a platform overview' },
        { label: '🏪 Active venues', message: 'How many venues are active?' },
        { label: '⚠️ Reports', message: 'Any flagged issues I should know about?' },
    ]

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center border border-slate-700"
                    aria-label="Open Admin Assistant"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
                    <Card className="flex flex-col h-full overflow-hidden shadow-2xl border-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-semibold">Admin Assistant</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearMessages}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                                    aria-label="Clear chat"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] bg-slate-50 dark:bg-slate-900">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                            ? 'bg-slate-800 text-white rounded-br-md'
                                            : 'bg-white dark:bg-slate-800 shadow-sm rounded-bl-md border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {msg.content.map((c, i) => (
                                            <span key={i}>
                                                {c.type === 'text' && c.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200 dark:border-slate-700">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick actions */}
                        {messages.length <= 1 && (
                            <div className="p-3 border-t bg-white dark:bg-slate-800 flex flex-wrap gap-2">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => sendMessage(action.message)}
                                        disabled={isLoading}
                                        className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t bg-white dark:bg-slate-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about claims, venues, analytics..."
                                    className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-full bg-slate-800 hover:bg-slate-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}

export default AdminAssistantChat
