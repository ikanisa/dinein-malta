import { useState, useRef, useEffect, useMemo } from 'react'
import { Button, Card } from '@dinein/ui'
import { MessageSquare, Send, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { useBarChat, type OrderSummary, type VenueSummary } from '@/lib/chatkit/useBarChat'
import { useOwner } from '@/context/OwnerContext'
import { useOrders } from '@/hooks/useOrders'
import { useVenueStats } from '@/hooks/useVenueStats'

/**
 * Bar Manager AI Assistant Chat Component
 * Floating chat widget with business-focused quick actions
 */
export function BarAssistantChat() {
    const { venue } = useOwner()
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get real-time order and stats data for AI context
    const { activeOrders, servedOrders } = useOrders()
    const { stats } = useVenueStats()

    // Memoize context to avoid recreating on every render
    const orderSummary: OrderSummary = useMemo(() => ({
        active: activeOrders.length,
        placed: activeOrders.filter(o => o.status === 'placed').length,
        inPrep: activeOrders.filter(o => o.status === 'received').length,
        served: servedOrders.length
    }), [activeOrders, servedOrders])

    const venueSummary: VenueSummary = useMemo(() => ({
        todayRevenue: stats.totalRevenue,
        currency: 'RWF', // Default currency
        trends: stats.trends
    }), [stats])

    const { messages, sendMessage, isLoading, error, clearMessages } = useBarChat({
        venueId: venue?.id || '',
        orderSummary,
        venueSummary
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
        { label: '📊 Today\'s sales', message: 'Show me today\'s sales summary' },
        { label: '🍹 Active orders', message: 'How many active orders do I have?' },
        { label: '⭐ Top sellers', message: 'What are my top selling items this week?' },
        { label: '📈 Performance', message: 'How is my venue performing compared to last week?' },
    ]

    if (!venue?.id) return null

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
                    aria-label="Open AI Assistant"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
                    <Card className="flex flex-col h-full overflow-hidden shadow-2xl border-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-semibold">Bar Assistant</span>
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
                                            ? 'bg-indigo-600 text-white rounded-br-md'
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
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
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
                                        className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
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
                                    placeholder="Ask about orders, sales, menu..."
                                    className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-full"
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

export default BarAssistantChat
