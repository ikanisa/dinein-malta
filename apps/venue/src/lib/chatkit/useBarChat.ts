import { useState, useCallback } from 'react'
import { supabase } from '@/shared/services/supabase'
import { Message } from './types'

export type AgentType = 'guest' | 'bar_manager' | 'admin'

export interface OrderSummary {
    active: number
    placed: number
    inPrep: number
    served: number
}

export interface VenueSummary {
    todayRevenue: number
    currency: string
    trends: { revenue: string; orders: string }
}

interface UseBarChatOptions {
    venueId: string
    agentType?: AgentType
    orderSummary?: OrderSummary
    venueSummary?: VenueSummary
    onWidget?: (widget: unknown) => void
}

/**
 * Hook for bar manager AI assistant chat
 * Extends base chatkit with bar_manager agent type and venue context
 */
export function useBarChat({
    venueId,
    agentType = 'bar_manager',
    orderSummary,
    venueSummary
}: UseBarChatOptions) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: [{ type: 'text', text: 'Hello! I\'m your bar assistant. I can help you manage orders, check sales analytics, and answer questions about your venue. What would you like to know?' }],
            createdAt: new Date().toISOString()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)

    const sendMessage = useCallback(async (text: string) => {
        // Optimistic update
        const tempId = 'temp_' + Date.now()
        const userMsg: Message = {
            id: tempId,
            role: 'user',
            content: [{ type: 'text', text }],
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            // SSE request to agent-chat
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        messages: messages.filter(m => m.id !== 'welcome').map(m => ({
                            role: m.role,
                            content: m.content.find(c => c.type === 'text')?.text || ''
                        })).concat([{ role: 'user', content: text }]),
                        agent_type: agentType,
                        venue_id: venueId,
                        session_id: sessionId,
                        stream: true,
                        // Provide real-time venue context for AI-powered insights
                        context: {
                            orders: orderSummary,
                            venue: venueSummary
                        }
                    })
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            if (!response.body) {
                throw new Error('No response body')
            }

            // Create assistant message for streaming
            const assistantMsgId = 'assistant_' + Date.now()
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: [{ type: 'text', text: '' }],
                createdAt: new Date().toISOString()
            }])

            // Stream response
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Parse SSE events
                const lines = buffer.split('\n')
                buffer = ''

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        try {
                            const jsonStr = line.slice(5).trim()
                            if (jsonStr === '[DONE]') continue

                            const data = JSON.parse(jsonStr)

                            // Extract session_id if present
                            if (data.session_id && !sessionId) {
                                setSessionId(data.session_id)
                            }

                            // Handle text chunks
                            if (data.chunk) {
                                setMessages(prev => prev.map(msg => {
                                    if (msg.id === assistantMsgId) {
                                        const newContent = [...msg.content]
                                        if (newContent[0]?.type === 'text') {
                                            newContent[0] = { ...newContent[0], text: newContent[0].text + data.chunk }
                                        }
                                        return { ...msg, content: newContent }
                                    }
                                    return msg
                                }))
                            }
                        } catch {
                            // Keep incomplete data in buffer
                            buffer = line + '\n'
                        }
                    }
                }
            }

        } catch (err) {
            console.error('Bar Chat Error:', err)
            setError(err instanceof Error ? err.message : 'Failed to send message')
        } finally {
            setIsLoading(false)
        }
    }, [messages, agentType, venueId, sessionId, orderSummary, venueSummary])

    const clearMessages = useCallback(() => {
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: [{ type: 'text', text: 'Hello! I\'m your bar assistant. I can help you manage orders, check sales analytics, and answer questions about your venue. What would you like to know?' }],
            createdAt: new Date().toISOString()
        }])
        setSessionId(null)
        setError(null)
    }, [])

    return {
        messages,
        sendMessage,
        isLoading,
        error,
        clearMessages
    }
}
